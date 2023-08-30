exports.successResponses = {
  default: {
    statusCode: 200,
    message: '',
  },
  COUNT_FETCH_SUCCESSFULL: {
    message: 'data fetched successful',
  },
  NO_DATA_FOUND: {
    message: 'no data found',
  },
};

exports.errorResponses = {
  default: {
    message: '',
  },
  healthCheckError: {
    message: 'Service unavailable',
  },
};
