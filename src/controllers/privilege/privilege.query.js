const { dbTables } = require('../../utils/constant');
const { activityStatus } = require('./privilege.constant');

exports.getDevicePrivileges = `
SELECT
    adve.model_id,
    adve.variant_id,
    adve.id AS version_id,
    CASE
        WHEN adve.model_id IS NOT NULL
        AND adve.variant_id IS NOT NULL THEN (
            SELECT
                json_build_object(
                    'model',
                    COALESCE(json_agg(
                      json_build_object('action_id', action_id, 'action_name', adma.action_name, 'category_id',aac.id, 'category_name', aac.category_name)
                  ) FILTER (
                      WHERE
                          model_id IS NOT NULL  
                          AND variant_id IS NULL
                          AND version_id IS NULL
                  ),'[]'),
                    'variant',
                   COALESCE( json_agg(
                    json_build_object('action_id', action_id,'action_name', adma.action_name, 'category_id',aac.id, 'category_name', aac.category_name)
                ) FILTER (
                    WHERE
                        model_id = adve.model_id
                        AND variant_id = adve.variant_id
                        AND version_id IS NULL
                ),'[]'),
                    'version',
                   COALESCE( json_agg(
                    json_build_object('action_id', action_id, 'action_name', adma.action_name,'category_id',aac.id, 'category_name', aac.category_name)
                ) FILTER (
                    WHERE
                        model_id = adve.model_id
                        AND variant_id = adve.variant_id
                        AND version_id = adve.id
                ),'[]')
                ) AS result
            FROM
                ${dbTables.DEVICE_ACTIONS_TABLE} AS ada
                LEFT JOIN ${dbTables.DEVICE_MASTER_ACTION_TABLE} AS adma ON adma.id = ada.action_id
                LEFT JOIN ${dbTables.DEVICE_ACTIONS_CATEGORY} AS aac ON aac.id = ada.category_id
            WHERE (
                    model_id = adve.model_id
                    AND variant_id IS NULL
                    AND version_id IS NULL
                )
                OR (
                    model_id = adve.model_id
                    AND variant_id = adve.variant_id
                    AND version_id IS NULL
                )
                OR (
                    model_id = adve.model_id
                    AND variant_id = adve.variant_id
                    AND version_id = adve.id
                )
        )
        ELSE '{}'
    END AS data
FROM
    ${dbTables.DEVICE_VERSION_TABLE} AS adve
WHERE adve.id = :version_id AND adve.status = '${activityStatus.ACTIVE}';
`;
