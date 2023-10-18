const { dbTables } = require('../../utils/constant');

exports.verifyActionsById = `
     WITH actions_to_check AS (
       SELECT unnest(ARRAY [:actions]) AS action
     )
     SELECT CASE
              WHEN COUNT(DISTINCT af.id) = (SELECT COUNT(*) FROM actions_to_check) THEN true
              ELSE false
          END AS result
     FROM actions_to_check itc
          LEFT JOIN ${dbTables.MASTER_ACTIONS_TABLE} as af ON itc.action = af.id;
`;

exports.getCategoriesQuery = `
     SELECT id, category_name, category_identifier, device_type
     FROM ${dbTables.ACTION_CATEGORIES_TABLE} AS aac 
          WHERE aac.id = :id
`;

exports.getValidActionsForVariant = `
SELECT ARRAY(
     SELECT DISTINCT input_action_id
     FROM unnest(ARRAY[:actions]) AS input_action_id
     WHERE NOT EXISTS (
         SELECT 1
         FROM ${dbTables.DEVICE_ACTIONS_TABLE} ada
         WHERE ada.action_id = input_action_id
         AND (ada.model_id = :model_id AND ada.variant_id IS NULL)
     )
 );
`;

exports.getValidActionsForVersion = `
SELECT ARRAY(
     SELECT DISTINCT input_action_id
     FROM unnest(ARRAY[:actions]) AS input_action_id
     WHERE NOT EXISTS (
         SELECT 1
         FROM ${dbTables.DEVICE_ACTIONS_TABLE} ada
         WHERE ada.action_id = input_action_id
         AND (ada.model_id = :model_id AND ada.variant_id = :variant_id AND ada.version_id IS NULL )
     )
 );
`;
