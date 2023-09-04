const { dbTables } = require('../../utils/constants');

exports.queries = {
  getDeviceCount: `SELECT
  adv.device_type AS type,
  COUNT(*) AS version_count,
  (SELECT COUNT(*) FROM ${dbTables.DEVICE_MODELS_TABLE} WHERE device_type = adv.device_type) AS model_count,
  (SELECT COUNT(*) FROM ${dbTables.DEVICE_VARIANT_TABLE} WHERE device_type = adv.device_type) AS variant_count
  FROM ${dbTables.DEVICE_VERSION_TABLE} AS adv
  GROUP BY adv.device_type;`,
};
