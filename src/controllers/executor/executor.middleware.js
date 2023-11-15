const { logger } = require('../../utils/logger');
const { errorResponse } = require('../../utils/responseHandler');
const { statusCodes } = require('../../utils/statusCode');
const { errorResponses } = require('./executor.constant');

exports.executorInputValidator = async (req, res, next) => {
  try {
    const { action, device_id: deviceId, parameter } = req.body;
    if (!action || typeof action !== 'string') {
      throw errorResponses.ACTION_REQUIRED;
    }
    if (!deviceId || typeof deviceId !== 'string') {
      throw errorResponses.DEVICE_REQUIRED;
    }
    if (!parameter) {
      throw errorResponses.PARAMETERS_REQUIRED;
    }
    return next();
  } catch (error) {
    logger.error(error);
    return errorResponse({
      req,
      res,
      error,
      message: error,
      code: statusCodes.STATUS_CODE_INVALID_FORMAT,
    });
  }
};
