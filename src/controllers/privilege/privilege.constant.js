const { levelStarting } = require('../../utils/constant');

exports.successResponses = {
  PRIVILEGES_ADDED: 'privileges were added to a personality successfully',
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
};
