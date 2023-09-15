const { levelStarting } = require('../../utils/constant');

exports.successResponses = {
  DATA_FETCH_SUCCESSFULL: 'data fetched successfully',
};

exports.errorResponses = {
  INTERNAL_ERROR: 'internal error',
  INVALID_VERSION: 'invalid version id',
  INVALID_ID: (value) => {
    return `invalid ${value} and it should be starting with ${levelStarting[value]}`;
  },
};

exports.activityStatus = {
  ACTIVE: 'ACTIVE',
};
