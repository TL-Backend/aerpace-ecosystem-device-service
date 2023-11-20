const { dbTables } = require('../../utils/constant');
const { status } = require('./device.constant');

exports.getAllDevicesFromType = `SELECT
    COALESCE(
        json_agg(
            json_build_object(
                'model', json_build_object(
                    'id', dm.id,
                    'name', dm.name,
                    'status', dm.status,
                    'variants', COALESCE(
                        (
                            SELECT json_agg(
                                json_build_object(
                                    'id', dv.id,
                                    'name', dv.name,
                                    'status', dv.status,
                                    'versions', COALESCE(
                                        (
                                            SELECT json_agg(
                                                json_build_object(
                                                    'id', dvv.id,
                                                    'name', dvv.name,
                                                    'status', dvv.status
                                                )
                                                ORDER BY dvv.updated_at DESC
                                            ) 
                                            FROM ${dbTables.DEVICE_VERSION_TABLE} AS dvv
                                            WHERE dvv.variant_id = dv.id
                                        ),
                                        '[]'
                                    )
                                )
                                ORDER BY dv.updated_at DESC
                            ) 
                            FROM ${dbTables.DEVICE_VARIANT_TABLE} AS dv
                            WHERE dv.model_id = dm.id
                        ),
                        '[]'
                    )
                )
            )
            ORDER BY dm.updated_at DESC
        ),
        '[]'
    ) AS data
FROM ${dbTables.DEVICE_MODELS_TABLE} AS dm
WHERE dm.device_type = :device_type`;

exports.queries = {
  getDeviceCount: `SELECT
    adm.device_type AS type,
  COUNT(*) AS model_count,
  (SELECT COUNT(*) FROM ${dbTables.DEVICE_VERSION_TABLE} AS adv WHERE device_type = adm.device_type AND adv.status = '${status.ACTIVE}' ) AS version_count,
  (SELECT COUNT(*) FROM ${dbTables.DEVICE_VARIANT_TABLE} AS adva WHERE device_type = adm.device_type AND adva.status = '${status.ACTIVE}' ) AS variant_count
  FROM  ${dbTables.DEVICE_MODELS_TABLE} AS adm WHERE adm.status = '${status.ACTIVE}'
  GROUP BY adm.device_type;`,
};

exports.getCategoriesQuery = `
     SELECT id, category_name, category_identifier, device_type
     FROM ${dbTables.ACTION_CATEGORIES_TABLE} AS aac 
          WHERE aac.id = :id
`;

exports.verifyActionsById = `
  WITH actions_to_check AS (
    SELECT unnest(ARRAY [:actions]) AS action
  )
  SELECT CASE
           WHEN COUNT(DISTINCT af.id) = (SELECT COUNT(*) FROM actions_to_check) THEN true
           ELSE false
       END AS result
  FROM actions_to_check itc
       LEFT JOIN aergov_device_master_actions as af ON itc.action = af.id
  WHERE af.device_type = :type;
`;

exports.getValidActionsForVersion = `
SELECT ARRAY(
  SELECT DISTINCT input_action_id
  FROM unnest(ARRAY[:actions]) AS input_action_id
  WHERE NOT EXISTS (
      SELECT 1
      FROM ${dbTables.DEVICE_ACTIONS} ada
      WHERE (
          (ada.action_id = input_action_id)
          AND (
              (ada.model_id = :model_id AND ada.variant_id IS NULL AND ada.version_id IS NULL)
              OR (ada.model_id = :model_id AND ada.variant_id = :variant_id AND ada.version_id IS NULL)
          )
      )
  )
);
`;

exports.getValidActionsForVariant = `
SELECT ARRAY(
  SELECT DISTINCT input_action_id
  FROM unnest(ARRAY[:actions]) AS input_action_id
  WHERE NOT EXISTS (
      SELECT 1
      FROM ${dbTables.DEVICE_ACTIONS} ada
      WHERE (ada.action_id = input_action_id)
      AND (ada.model_id = :model_id AND ada.variant_id IS NULL)
  )
);
`;

exports.checkDeviceData = `
SELECT
  CASE
    WHEN NOT EXISTS (
      SELECT 1
      FROM ${dbTables.DEVICE_MODEL_PRIVILEGES}
      WHERE model_id = :model_id
      AND variant_id = :variant_id
      AND version_id = :version_id
    )
    AND EXISTS (
      SELECT 1
      FROM ${dbTables.DEVICE_VERSION_TABLE}
      WHERE model_id = :model_id
      AND variant_id = :variant_id
      AND id = :version_id
    )
    THEN true
    ELSE false
  END AS Result;
`;
exports.checkVariantData = `
SELECT
  CASE
    WHEN NOT EXISTS (
      SELECT 1
      FROM ${dbTables.DEVICE_VERSION_TABLE}
      WHERE model_id = :model_id
      AND variant_id = :variant_id
    )
    AND EXISTS (
      SELECT 1
      FROM ${dbTables.DEVICE_VARIANT_TABLE}
      WHERE model_id = :model_id
      AND id = :variant_id
    )
    THEN true
    ELSE false
  END AS Result;
`;

exports.checkModelData = `
SELECT
CASE
  WHEN NOT EXISTS (
    SELECT 1
    FROM ${dbTables.DEVICE_VARIANT_TABLE}
    WHERE model_id = :model_id
  )
  AND EXISTS (
    SELECT 1
    FROM ${dbTables.DEVICE_MODELS_TABLE}
    WHERE id = :model_id
  )
  THEN true
  ELSE false
END AS Result;
`;

exports.getPersonalityPrivileges = `
SELECT     
json_agg(
    json_build_object(
        'name',
        user_type,
       'privileges', 
        privileges
    )
) AS personalities
FROM ${dbTables.DEVICE_MODEL_PRIVILEGES}
WHERE
model_id = :model_id
AND variant_id = :variant_id
AND version_id = :version_id
`;

exports.getVersionData = `
SELECT
    adm.device_type AS type,
    adm.name AS model_name,
    adm.id AS model_id,
    adva.name AS variant_name,
    adva.id AS variant_id,
    adve.name AS version_name,
    adve.id AS version_id,
    adve.status AS status
FROM
    ${dbTables.DEVICE_VERSION_TABLE} AS adve
    LEFT JOIN ${dbTables.DEVICE_MODELS_TABLE} AS adm ON adm.id = adve.model_id
    LEFT JOIN ${dbTables.DEVICE_VARIANT_TABLE} AS adva ON adva.id = adve.variant_id
WHERE adve.id = :id
`;

exports.getVariantData = `
SELECT
    adm.device_type AS type,
    adm.name AS model_name,
    adm.id AS model_id,
    adva.name AS variant_name,
    adva.id AS variant_id,
    null AS version_name,
    null AS version_id,
    adva.status AS status
FROM
    ${dbTables.DEVICE_VARIANT_TABLE} AS adva
    LEFT JOIN ${dbTables.DEVICE_MODELS_TABLE} AS adm ON adm.id = adva.model_id
WHERE adva.id = :id
`;

exports.getModelData = `
SELECT
    adm.device_type AS type,
    adm.name AS model_name,
    adm.id AS model_id,
    null AS variant_name,
    null AS variant_id,
    null AS version_name,
    null AS version_id,
    adm.status AS status
FROM
  ${dbTables.DEVICE_MODELS_TABLE} AS adm
WHERE adm.id = :id
`;
