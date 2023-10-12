const { errorResponses } = require('./device.constant');
const { logger } = require('../../utils/logger');
const { errorResponse } = require('../../utils/responseHandler');
const { statusCodes } = require('../../utils/statusCode');
const { errorMessages } = require('./device.constant');
const { levelStarting } = require('../../utils/constant');
exports.validateGetDevicesTypeInput = async (request, response, next) => {
  try {
    const deviceType = request.params.device_type; // Device type values are like car, drone etc..
    if (!deviceType || typeof deviceType !== 'string' || !deviceType?.trim()) {
      throw errorResponses.INVALID_DEVICE_TYPE(deviceType);
    }
    return next();
  } catch (error) {
    logger.error(error);
    return errorResponse({
      request,
      response,
      error,
      message: error,
      code: statusCodes.STATUS_CODE_INVALID_FORMAT,
    });
  }
};

exports.validateGetPersonalityPrivilegesInput = async (req, res, next) => {
  try {
    const { model_id, variant_id, version_id } = req.query;
    let errorList = [];
    if (
      !model_id ||
      typeof model_id !== 'string' ||
      !model_id.startsWith(levelStarting.model)
    ) {
      errorList.push(errorResponses.MODEL_ID_INVALID);
    }
    if (
      !variant_id ||
      typeof variant_id !== 'string' ||
      !variant_id.startsWith(levelStarting.variant)
    ) {
      errorList.push(errorResponses.VARIANT_ID_INVALID);
    }
    if (
      !version_id ||
      typeof version_id !== 'string' ||
      !version_id.startsWith(levelStarting.version)
    ) {
      errorList.push(errorResponses.VERSION_ID_INVALID);
    }
    if (errorList.length) {
      throw errorList.join(', ');
    }
    return next();
  } catch (err) {
    logger.error(err);
    return errorResponse({
      req,
      res,
      message: err,
      code: statusCodes.STATUS_CODE_INVALID_FORMAT,
    });
  }
};
