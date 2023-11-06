exports.successResponses = {
  DEVICE_CREATED: 'Device created successfully',
  ACTIONS_ADDED: 'actions added successfully',
  COUNT_FETCH_SUCCESSFULL: 'data fetched successful',
  NO_DATA_FOUND: 'no data found',
  DATA_FETCH_SUCCESSFULL: 'data fetched successfully',
  DEVICES_FETCHED_MESSAGE: 'devices fetched successfully',
  DEVICES_EDITED_SUCCESSFULLY: 'Devices edited successfully',
  ENTRIES_DELETED_SUCCESSFUL: 'Entries deleted successfully',
};

exports.deviceTypes = {
  CAR: `CAR`,
};

exports.errorResponses = {
  INVALID_DEVICE_TYPE: (value) => {
    return `Invalid device type ${value}`;
  },
  MODEL_ID_INVALID: 'Invalid model',
  VARIANT_ID_INVALID: 'Invalid variant',
  VERSION_ID_INVALID: 'Invalid version',
  INVALID_STRING_OR_MISSING_ERROR: (value) => {
    return `${value} should be present and it must be an string`;
  },
  INVALID_OBJECT_OR_MISSING_ERROR: (value) => {
    return `${value} should be present and it must be an object`;
  },
  MISSING_INVALID_DEVICE_TYPE: `Missing or invalid device type.`,
  INVALID_MODEL_ID_TYPE: `Model id should be of type string and should start with m_ .`,
  INVALID_VARIANT_ID_TYPE: `Variant id should be of type string and should start with va_ .`,
  INTERNAL_ERROR: `Internal error.`,
  NAME_EXISTS: `Name already exists.`,
  INVALID_ACTIONS: `Actions should be present in privileges and it must be object.`,
  INVALID_CATEGORY_ID: `Category id must be present in privileges and it must be integer.`,
  IMPROPER_CATEGORY_OR_ACTIONS: `Please enter proper category id or proper actions.`,
  INVALID_MODEL: `Invalid model id.`,
  INVALID_VARIANT: `Invalid variant id.`,
  UNABLE_TO_PERFORM_EDIT_OPERATION:
    'Unable to perform edit operation for device details',
  MODEL_ID_MISSING: `Model Id must be passed.`,
  NO_VALID_ACTIONS_TO_UPDATE: `No valid actions to update.`,
  INVALID_VERSION_ID_TYPE: `Version id should be of type string and should start with ver_ .`,
  MODEL_OR_VARIANT_ID_MISSING: `Model Id or Variant Id is missing.`,
  NO_DATA_FOUND: `Data not found with the given Id`,
};

exports.status = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DRAFT: `DRAFT`,
};
