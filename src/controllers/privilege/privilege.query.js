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
