const { logger } = require('../../utils/logger');
const {
  errorResponse,
  successResponse,
} = require('../../utils/responseHandler');
const { statusCodes } = require('../../utils/statusCode');
const { errorResponses } = require('./device.constant');
const { addDeviceLevel } = require('./device.helper');

exports.createDeviceLevel = async (req, res, next) => {
  try {
    const { success, message, errorCode, data } = await addDeviceLevel(
      req.body,
    );

    if (!success) {
      return errorResponse({
        req,
        res,
        message: message,
        code: errorCode,
      });
    }
    return successResponse({
      req,
      res,
      data,
      message,
      code: errorCode,
    });
  } catch (err) {
    logger.error(err);
    return errorResponse({
      req,
      res,
      message: errorResponses.INTERNAL_ERROR,
      code: statusCodes.STATUS_CODE_FAILURE,
    });
  }
};
