const {
  successResponse,
  errorResponse,
} = require('../../utils/responseHandler');

const { statusCodes } = require('../../utils/statusCodes');
const { logger } = require('../../utils/logger');

const sampleTest = async (req, res, next) => {
  try {
    logger.info('success');
    return successResponse({
      req,
      res,
      message: 'sample test route executed successfully',
      code: statusCodes.STATUS_CODE_SUCCESS,
    });
  } catch (err) {
    logger.error('error');
    return errorResponse({
      req,
      res,
      code: statusCodes.STATUS_CODE_FAILURE,
      error: err,
    });
  }
};

module.exports = {
  sampleTest,
};
