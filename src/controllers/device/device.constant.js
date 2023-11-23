exports.successResponses = {
  DEVICE_CREATED: 'Device created successfully',
  ACTIONS_ADDED: 'Actions added successfully',
  COUNT_FETCH_SUCCESSFUL: 'Data fetched successful',
  NO_DATA_FOUND: 'No data found',
  DATA_FETCH_SUCCESSFUL: 'Data fetched successfully',
  DEVICES_FETCHED_MESSAGE: 'Devices fetched successfully',
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
    return `${value} cannot be empty and it must be an character(s)`;
  },
  INVALID_PRIVILEGES: `Something went wrong`,
  MISSING_INVALID_DEVICE_TYPE: `Missing or invalid device type.`,
  INVALID_MODEL_ID_TYPE: `Something went wrong.`,
  INVALID_VARIANT_ID_TYPE: `Something went wrong.`,
  INTERNAL_ERROR: `Internal error.`,
  MODEL_NAME_EXISTS: `Model name already exists.`,
  VARIANT_NAME_EXISTS: `Variant name already exists.`,
  VERSION_NAME_EXISTS: `Version name already exists.`,
  INVALID_ACTIONS: `Something went wrong`,
  INVALID_CATEGORY_ID: `Category id must be present in privileges and it must be numeric.`,
  IMPROPER_CATEGORY_OR_ACTIONS: `Improper category id or improper actions.`,
  INVALID_MODEL: `Invalid model id.`,
  INVALID_VARIANT: `Invalid variant id.`,
  INVALID_VERSION: `Invalid version id.`,
  UNABLE_TO_PERFORM_EDIT_OPERATION: 'Unable to edit device in current status',
  MODEL_ID_MISSING: `Model Id cannot be empty.`,
  NO_VALID_ACTIONS_TO_UPDATE: `No valid actions to update.`,
  INVALID_VERSION_ID_TYPE: `Something went wrong.`,
  MODEL_OR_VARIANT_ID_MISSING: `Model Id or Variant Id is missing.`,
  NO_DATA_FOUND: `No Data found`,
  NO_DEVICE_INPUT: `Either model_id or variant_id or version_id must be given `,
  SOMETHING_WENT_WRONG: `Something went wrong`,
};

exports.status = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DRAFT: `DRAFT`,
};
