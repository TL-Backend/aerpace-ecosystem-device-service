const { levelStarting } = require('../../utils/constant');

exports.successResponses = {
  NO_DATA_FOUND: 'no data found',
  PRIVILEGES_ADDED: 'privileges were added to a personality successfully',
  DATA_FETCH_SUCCESSFUL: 'data fetched successfully',
};

exports.errorResponses = {
  INTERNAL_ERROR: 'internal error',
  INVALID_DEVICE_TYPE: (value) => {
    return `Invalid device type ${value}`;
  },
  INVALID_STRING_OR_MISSING_ERROR: (value) => {
    return `${value} should be present and it must be an string`;
  },
  INVALID_LEVEL_ID: (level) => {
    return `${level.toLowerCase()} Id should be present which should be string and start with ${
      levelStarting[level]
    }`;
  },
  INVALID_OBJECT_OR_MISSING_ERROR: (value) => {
    return `${value} should be present and it must be an object`;
  },
  INVALID_PERSONALITY: (value) => {
    return `Invalid personality: ${value} is sent in privileges`;
  },
  INVALID_ACTIONS: (value) => {
    return `List of actions should be present  for the personality: ${value} `;
  },
  INVALID_ID: (level, levelId) => {
    return `Given ${level} Id : ${levelId} is invalid`;
  },
  INVALID_ACTION_ID: `Improper list of action id's were given.`,
  PERSONALITY_ALREADY_EXISTS: `The given personality already exists, please try updating them. `,
  INVALID_VERSION: 'invalid version id',
  LEVEL_ID_NOT_FOUND: 'Invalid id or data not found',
  INVALID_DEVICE_ID: (value) => {
    return `invalid ${value} and it should be starting with ${levelStarting[value]}`;
  },
  INVALID_ID_TYPE: `Invalid Id and and it should be starting with ${levelStarting.MODEL} or ${levelStarting.VARIANT}`,
  INVALID_MODEL_VARIANT_COMBINATION: 'invalid model or variant id',
  INVALID_TYPE: 'invalid device type',
  INVALID_MODEL_ID: 'invalid model id',
  INVALID_VARIANT_ID: 'invalid variant id, or model_id is missing',
  INVALID_INPUT_ID: `Invalid Id and and it should be starting with ${levelStarting.MODEL} or ${levelStarting.VARIANT} or ${levelStarting.VERSION}`,
};

exports.activityStatus = {
  ACTIVE: 'ACTIVE',
};
