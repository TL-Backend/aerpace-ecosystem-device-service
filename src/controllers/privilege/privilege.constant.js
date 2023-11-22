const { levelStarting } = require('../../utils/constant');

exports.successResponses = {
  NO_DATA_FOUND: 'No data found',
  PRIVILEGES_ADDED: 'Privileges were added to a personality successfully',
  DATA_FETCH_SUCCESSFUL: 'Data fetched successfully',
};

exports.errorResponses = {
  INTERNAL_ERROR: 'internal error',
  INVALID_DEVICE_TYPE: (value) => {
    return `Invalid device type ${value}`;
  },
  INVALID_STRING_OR_MISSING_ERROR: (value) => {
    return `${value} cannot be empty and it must be an character(s)`;
  },
  INVALID_LEVEL_ID: (level) => {
    return `Something went wrong`;
  },
  INVALID_OBJECT_OR_MISSING_ERROR: (value) => {
    return `${value} cannot be empty.`;
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
  LEVEL_ID_NOT_FOUND: 'Invalid id or data not found',
  INVALID_ID_TYPE: `Something went wrong`,
  INVALID_TYPE: 'Invalid device type',
  INVALID_INPUT_ID: `Something went wrong`,
};

exports.activityStatus = {
  ACTIVE: 'ACTIVE',
};
