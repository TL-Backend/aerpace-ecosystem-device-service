const { dbTables, deviceLevels } = require('../../utils/constant');

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
