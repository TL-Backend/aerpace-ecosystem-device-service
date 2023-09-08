
exports.successResponses = {
  COUNT_FETCH_SUCCESSFULL: 'data fetched successful',
  NO_DATA_FOUND: 'no data found',
  DATA_FETCH_SUCCESSFULL: 'data fetched successfully',
  DEVICES_FETCHED_MESSAGE: 'devices fetched successfully',
};

exports.errorResponses = {
  INTERNAL_ERROR: 'internal error',
  INVALID_DEVICE_TYPE: (value) => {
    return `Invalid device type ${value}`;
  }
};

exports.status = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};
