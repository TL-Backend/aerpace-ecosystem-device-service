exports.queries = {
  getDeviceCount: `SELECT
  adv.device_type AS type,
  COUNT(*) AS version_count,
  (SELECT COUNT(*) FROM aergov_device_models WHERE device_type = adv.device_type) AS model_count,
  (SELECT COUNT(*) FROM aergov_device_variants WHERE device_type = adv.device_type) AS variant_count
  FROM aergov_device_versions AS adv
  GROUP BY adv.device_type;`,
};
