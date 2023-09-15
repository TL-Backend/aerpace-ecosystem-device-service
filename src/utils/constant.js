exports.dbTables = {
  DEVICE_MODELS_TABLE: 'aergov_device_models',
  DEVICE_VARIANT_TABLE: 'aergov_device_variants',
  DEVICE_VERSION_TABLE: 'aergov_device_versions',
  DEVICE_ACTIONS: `aergov_device_actions`,
  DEVICE_MASTER_ACTIONS: `aergov_device_master_actions`,
  ACTION_CATEGORIES: `aergov_action_categories`,
};

exports.levelStarting = {
  MODEL: 'm_',
  VARIANT: 'va_',
  VERSION: 'ver_',
};

exports.successResponses = {
  SUCCESS: `operation performed successfully`,
};

exports.errorResponses = {
  FAILURE: `Failed to perform the operation`,
};

exports.deviceLevels = {
  MODEL: `MODEL`,
  VARIANT: `VARIANT`,
  VERSION: `VERSION`,
};
