const { dbTables } = require('../../utils/constant');

exports.fetchUserQuery = `
  SELECT *
  FROM ${dbTables.USERS_TABLE} AS au
  LEFT JOIN ${dbTables.DEVICE_USERS} AS adu ON adu.member_id = au.id
  WHERE au.id = :user_id
`;

exports.checkPrivileges = `
SELECT *
FROM ${dbTables.DEVICE_TABLE} AS ad
LEFT JOIN ${dbTables.DEVICE_MODEL_PRIVILEGES} AS admp
    ON (
        admp.model_id = ad.model_id
        AND admp.version_id = ad.version_id
        AND admp.variant_id = ad.variant_id
    )
WHERE (ad.id = :device_id
AND admp.privileges ? :action_identifier
AND admp.user_type = :user_type);
`;
