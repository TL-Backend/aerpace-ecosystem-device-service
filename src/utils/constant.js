exports.dbTables = {
  MASTER_ACTIONS_TABLE: `aergov_device_master_actions`,
  DEVICE_MODELS_TABLE: `aergov_device_models`,
  DEVICE_VARIANT_TABLE: `aergov_device_variants`,
  DEVICE_VERSION_TABLE: `aergov_device_versions`,
  DEVICE_ACTIONS: `aergov_device_actions`,
  DEVICE_MASTER_ACTIONS: `aergov_device_master_actions`,
  ACTION_CATEGORIES: `aergov_action_categories`,
  DEVICE_MODEL_PRIVILEGES: `aergov_device_model_privileges`,
  ROLES_TABLE: 'aergov_roles',
  USER_ROLES_TABLE: 'aergov_user_roles',
  USERS_TABLE: `aergov_users`,
  DEVICE_USERS: `aergov_device_users`,
  DEVICE_TABLE: `aergov_devices`,
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
