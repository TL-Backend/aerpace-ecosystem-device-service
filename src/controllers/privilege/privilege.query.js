const { dbTables } = require('../../utils/constant');

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
    ${dbTables.DEVICE_ACTION_CATEGORIES} AS aac
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
