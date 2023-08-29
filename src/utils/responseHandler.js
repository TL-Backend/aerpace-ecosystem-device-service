/**
 * Response handler methods to maintain common response format for all APIs.
 */

const { statusCodes } = require('./statusCodes');

const successResponse = ({
  req,
  res,
  data = {},
  code = statusCodes.STATUS_CODE_SUCCESS,
  message = '',
}) => res.status(code).send({ data, code, message });

const errorResponse = ({
  req,
  res,
  data = {},
  code = statusCodes.STATUS_CODE_FAILURE,
  message = 'Internal server error',
  error = null,
}) => {
  code = error
    ? error.error
      ? error.error.code
        ? error.error.code
        : code
      : (
          err.code
            ? error.code
            : code || error.statusCode
            ? error.statusCode
            : code
        )
      ? error.code
        ? error.code
        : code || error.statusCode
        ? error.statusCode
        : code
      : code
    : code;

  return res.status(code).send({
    data,
    code,
    message,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
