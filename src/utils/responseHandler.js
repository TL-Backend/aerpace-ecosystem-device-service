/**
 * Response handler methods to maintain common response format for all APIs.
 */

const { statusCodes } = require('./statusCode');

exports.successResponse = ({
  req,
  res,
  data = {},
  code = statusCodes.STATUS_CODE_SUCCESS,
  message = '',
}) => res.status(code).send({ data, code, message });

exports.errorResponse = ({
  req,
  res,
  data = {},
  code = statusCodes.STATUS_CODE_FAILURE,
  message = 'Internal server error',
  error = null,
}) => res.status(code).send({ data, code, message });
