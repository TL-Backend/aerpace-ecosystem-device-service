const { dbTables } = require('../../utils/constant');
const { status } = require('./devices.constant');

exports.queries = {
  getDeviceCount: `SELECT
  adv.device_type AS type,
  COUNT(*) AS version_count,
  (SELECT COUNT(*) FROM ${dbTables.DEVICE_MODELS_TABLE} AS adm WHERE device_type = adv.device_type AND adm.status = '${status.ACTIVE}' ) AS model_count,
  (SELECT COUNT(*) FROM ${dbTables.DEVICE_VARIANT_TABLE} AS adva WHERE device_type = adv.device_type AND adva.status = '${status.ACTIVE}' ) AS variant_count
  FROM ${dbTables.DEVICE_VERSION_TABLE} AS adv WHERE adv.status = '${status.ACTIVE}'
  GROUP BY adv.device_type;`,
};
