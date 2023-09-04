exports.successResponses = {
  default: {
    statusCode: 200,
    message: '',
  },
  COUNT_FETCH_SUCCESSFULL: 'data fetched successful',
  NO_DATA_FOUND: 'no data found',
  DATA_FETCH_SUCCESSFULL: 'data fetched successfully',
};

exports.errorResponses = {
  default: {
    message: '',
  },
  healthCheckError: {
    message: 'Service unavailable',
  },
};
