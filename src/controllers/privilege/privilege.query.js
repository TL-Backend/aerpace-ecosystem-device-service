const { dbTables, deviceLevels } = require('../../utils/constant');
const { activityStatus } = require('./privilege.constant');

exports.getDevicePrivileges = `
SELECT
    json_build_object(
        'model',
        COALESCE(
            json_agg(
                json_build_object(
                    'action_id',
                    action_id,
                    'action_name',
                    adma.action_name,
                    'category_id',
                    aac.id,
                    'category_name',
                    aac.category_name
                )
            ) FILTER (
                WHERE
                    model_id = ada.model_id
                    AND variant_id IS NULL
                    AND version_id IS NULL
            ),
            '[]'
        ),
        'variant',
        COALESCE(
            json_agg(
                json_build_object(
                    'action_id',
                    action_id,
                    'action_name',
                    adma.action_name,
                    'category_id',
                    aac.id,
                    'category_name',
                    aac.category_name
                )
            ) FILTER (
                WHERE
                    model_id = ada.model_id
                    AND variant_id = ada.variant_id
                    AND version_id IS NULL
            ),
            '[]'
        ),
        'version',
        COALESCE(
            json_agg(
                json_build_object(
                    'action_id',
                    action_id,
                    'action_name',
                    adma.action_name,
                    'category_id',
                    aac.id,
                    'category_name',
                    aac.category_name
                )
            ) FILTER (
                WHERE
                    model_id = ada.model_id
                    AND variant_id = ada.variant_id
                    AND version_id = ada.version_id
            ),
            '[]'
        )
    ) AS result
FROM
    aergov_device_actions AS ada
    LEFT JOIN aergov_device_master_actions AS adma ON adma.id = ada.action_id
    LEFT JOIN aergov_action_categories AS aac ON aac.id = ada.category_id -- WHERE
WHERE (
        ada.model_id = :model_id
        AND ada.variant_id IS NULL
        AND ada.version_id IS NULL
    )
    OR (
        ada.model_id = :model_id
        AND ada.variant_id = :variant_id
        AND ada.version_id IS NULL
    )
    OR (
        ada.model_id = :model_id
        AND ada.variant_id = :variant_id
        AND ada.version_id = :version_id
    )
`;

exports.getPrivileges = `
SELECT
    aac.id,
    aac.category_name AS category,
    COALESCE(
        json_agg(
            json_build_object(
                'id',
                adma.id,
                'action_name',
                adma.action_name,
                'action_identifier',
                adma.action_identifier
            )
        ),
        '[]'
    ) AS actions
FROM
    ${dbTables.ACTION_CATEGORIES} AS aac
    JOIN ${dbTables.DEVICE_MASTER_ACTIONS} AS adma ON adma.category_id = aac.id {{queryCondition}}
WHERE aac.device_type = :type
GROUP BY
    aac.id,
    aac.category_name;
`;

exports.getDeviceVariants = `
SELECT EXISTS (
    (    SELECT * FROM ${dbTables.DEVICE_VERSION_TABLE} AS adve {{condition}}
    ));
`;

exports.conditions = {
  versionJoinCondition: ` INNER JOIN ${dbTables.DEVICE_MODELS_TABLE} AS adm ON adve.model_id = adm.id INNER JOIN ${dbTables.DEVICE_VARIANT_TABLE} AS adva ON adve.variant_id = adva.id WHERE adve.model_id = :model_id AND adve.variant_id = :variant_id`,
  variantJoinCondition: ` INNER JOIN ${dbTables.DEVICE_MODELS_TABLE} AS adm ON adve.model_id = adm.id WHERE adve.model_id = :model_id `,
};

exports.filterConditionQuery = (modelId, variantId) => {
  return ` AND adma.id NOT IN (SELECT action_id FROM ${dbTables.DEVICE_ACTIONS} WHERE (model_id = '${modelId}' AND variant_id is NUll) OR (model_id = '${modelId}' AND variant_id = '${variantId}' AND version_id is NULL))`;
};

exports.getActions = `
  SELECT jsonb_object_agg(action_identifier, action_data) AS all_action_data
  FROM (
      SELECT
          ads.action_id,
          adma.action_identifier,
          CASE
              WHEN ads.version_id IS NOT NULL AND ads.version_id = :version_id THEN 
                  jsonb_build_object(
                      'effective_level_id', ads.version_id,
                      'effective_level', '${deviceLevels.VERSION}',
                      'action_id', ads.action_id,
                      'category_id', ads.category_id,
                      'category_name', aac.category_name,
                      'action_name', adma.action_name,
                      'action_identifier', adma.action_identifier
                  )
              WHEN ads.variant_id IS NOT NULL AND ads.variant_id = :variant_id AND ads.version_id IS NULL THEN
                  jsonb_build_object(
                      'effective_level_id', ads.variant_id,
                      'effective_level', '${deviceLevels.VARIANT}',
                      'action_id', ads.action_id,
                      'category_id', ads.category_id,
                      'category_name', aac.category_name,
                      'action_name', adma.action_name,
                      'action_identifier', adma.action_identifier
                  )
              WHEN ads.model_id IS NOT NULL AND ads.model_id = :model_id AND ads.version_id IS NULL AND ads.variant_id IS NULL THEN 
                  jsonb_build_object(
                      'effective_level_id', ads.model_id,
                      'effective_level', '${deviceLevels.MODEL}',
                      'action_id', ads.action_id,
                      'category_id', ads.category_id,
                      'category_name', aac.category_name,
                      'action_name', adma.action_name,
                      'action_identifier', adma.action_identifier
                  )
              ELSE NULL
          END AS action_data
      FROM ${dbTables.DEVICE_ACTIONS} AS ads
        LEFT JOIN ${dbTables.DEVICE_MASTER_ACTIONS} AS adma ON adma.id = ads.action_id
        LEFT JOIN ${dbTables.ACTION_CATEGORIES} AS aac ON aac.id = ads.category_id
      WHERE action_id = ANY(ARRAY [:actions])
  ) AS subquery
  WHERE action_data IS NOT NULL;
`;

exports.validateActionIds = `
    WITH master_actions_count AS (
        SELECT COUNT(*) AS master_count
        FROM ${dbTables.DEVICE_MASTER_ACTIONS}
        WHERE id = ANY (ARRAY [:actions])
    ),
    actions_count AS (
        SELECT COUNT(*) AS actions_count
        FROM ${dbTables.DEVICE_ACTIONS} AS actions
        WHERE action_id = ANY(ARRAY [:actions])
        AND (
            (version_id = :version_id AND actions.action_id = ANY(ARRAY [:actions])) OR
            (variant_id = :variant_id AND actions.action_id = ANY(ARRAY [:actions]) AND version_id IS NULL) OR
            (model_id = :model_id AND actions.action_id = ANY(ARRAY [:actions]) AND variant_id IS NULL AND version_id IS NULL)
        )
    )
    SELECT master_count = ARRAY_LENGTH(ARRAY [:actions], 1) AND master_count = actions_count AS result
    FROM master_actions_count, actions_count;
`;

exports.modelDataQuery = `SELECT * from ${dbTables.DEVICE_MODELS_TABLE} WHERE id = :id`;
exports.variantDataQuery = `SELECT * from ${dbTables.DEVICE_VARIANT_TABLE} WHERE id = :id`;
exports.versionDataQuery = `SELECT * from ${dbTables.DEVICE_VERSION_TABLE} WHERE id = :id`;

exports.modelVariantVersionDataQuery = `
SELECT
    'VERSION' AS level,
    model_id AS model_id,
    variant_id AS variant_id,
    id AS version_id
FROM aergov_device_versions
WHERE id = :id
UNION ALL
SELECT
    'VARIANT' AS level,
    model_id AS model_id,
    id AS variant_id,
    NULL AS version_id
FROM aergov_device_variants
WHERE id = :id
UNION ALL
SELECT
    'MODEL' AS level,
    id AS model_id,
    NULL AS variant_id,
    NULL AS version_id
FROM aergov_device_models
WHERE id = :id
`;
