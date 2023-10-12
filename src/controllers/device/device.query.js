const { dbTables } = require('../../utils/constant');
const { status } = require('./device.constant');

exports.getAllDevicesFromType = `SELECT
    COALESCE(
        json_agg(
            json_build_object(
                'model', json_build_object(
                    'id', dm.id,
                    'name', dm.name,
                    'status', '',
                    'variants', COALESCE(
                        (
                            SELECT json_agg(
                                json_build_object(
                                    'id', dv.id,
                                    'name', dv.name,
                                    'status', '',
                                    'versions', COALESCE(
                                        (
                                            SELECT json_agg(
                                                json_build_object(
                                                    'id', dvv.id,
                                                    'name', dvv.name,
                                                    'status', dvv.status
                                                )
                                            ) 
                                            FROM aergov_device_versions AS dvv
                                            WHERE dvv.variant_id = dv.id
                                        ),
                                        '[]'
                                    )
                                )
                            ) 
                            FROM aergov_device_variants AS dv
                            WHERE dv.model_id = dm.id
                        ),
                        '[]'
                    )
                )
            )
        ),
        '[]'
    ) AS data
FROM aergov_device_models AS dm
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

exports.getPersonalityPrivileges = `
    SELECT     
    json_agg(
        json_build_object(
            'name',
            user_type,
            'privileges',
            privileges
        )
    ) AS persoanlities
    FROM ${dbTables.DEVICE_MODEL_PRIVILEGES}
    WHERE
    model_id = :model_id
    AND variant_id = :variant_id
    AND version_id = :version_id
`;
