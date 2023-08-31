const { logger } = require('../../utils/logger');
const {
  errorResponse,
  successResponse,
} = require('../../utils/responseHandler');
const { statusCodes } = require('../../utils/statusCodes');
const { errorResponses } = require('./devices.constants');
const { addDevices } = require('./devices.helper');

exports.createDevices = async (req, res, next) => {
  try {
    const { success, message, code, data } = await addDevices(req.body);

    if (!success) {
      return errorResponse({
        req,
        res,
        message: message,
        code: code,
      });
    }
    return successResponse({
      req,
      res,
      data,
      message: message,
      code: code,
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
