const { dbTables } = require('../../utils/constants');

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
