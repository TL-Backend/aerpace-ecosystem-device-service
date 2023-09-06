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
WHERE dm.device_type = :device_type`