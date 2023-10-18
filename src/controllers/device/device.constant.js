exports.successResponses = {
  DEVICE_CREATED: 'Device created successfully',
  ACTIONS_ADDED: 'actions added successfully',
  COUNT_FETCH_SUCCESSFULL: 'data fetched successful',
  NO_DATA_FOUND: 'no data found',
  DATA_FETCH_SUCCESSFULL: 'data fetched successfully',
  DEVICES_FETCHED_MESSAGE: 'devices fetched successfully',
};

exports.errorResponses = {
  INVALID_DEVICE_TYPE: (value) => {
    return `Invalid device type ${value}`;
  },
  INVALID_STRING_OR_MISSING_ERROR: (value) => {
    return `${value} should be present and it must be an string`;
  },
  INVALID_OBJECT_OR_MISSING_ERROR: (value) => {
    return `${value} should be present and it must be an object`;
  },
  INVALID_MODEL_ID_TYPE: `Model id should be of type string and should start with m_ .`,
  INVALID_VARIANT_ID_TYPE: `Variant id should be of type string and should start with va_ .`,
  INTERNAL_ERROR: `Internal error.`,
  NAME_EXISTS: `Name already exists.`,
  INVALID_ACTIONS: `Actions should be present in privileges and it must be object.`,
  INVALID_CATEGORY_ID: `Category id must be present in privileges and it must be integer.`,
  IMPROPER_CATEGORY_OR_ACTIONS: `Please enter proper category id or proper actions.`,
  INVALID_MODEL: `Invalid model id.`,
  INVALID_VARIANT: `Invalid variant id.`,
  MODEL_ID_MISSING: `Model Id must be passed.`,
};
exports.successResponses = {
  COUNT_FETCH_SUCCESSFULL: 'data fetched successful',
  NO_DATA_FOUND: 'no data found',
  DATA_FETCH_SUCCESSFULL: 'data fetched successfully',
  DEVICES_FETCHED_MESSAGE: 'devices fetched successfully',
};
