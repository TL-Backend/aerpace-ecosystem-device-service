exports.successResponses = {
  DEVICE_CREATED: 'Device created successfully',
  ACTIONS_ADDED: 'actions added successfully',
};

exports.errorResponses = {
  INVALID_STRING_OR_MISSING_ERROR: (value) => {
    return `${value} should be present and it must be an string`;
  },
  INVALID_OBJECT_OR_MISSING_ERROR: (value) => {
    return `${value} should be present and it must be an object`;
  },
  INTERNAL_ERROR: 'Internal error',
  NAME_EXISTS: 'name already exists',
  INVALID_ACTIONS:
    'Actions should be present in privileges and it must be object',
  INVALID_CATEGORY_ID:
    'category id must be present in privileges and it must be integer',
  IMPROPER_CATEGORY_OR_ACTIONS: `please enter proper category id or proper actions`,
  INVALID_MODEL: `Invalid model id`,
  INVALID_VARIANT: `Invalid variant id`,
};
