const { logger } = require('../../utils/logger');
const {
  errorResponse,
  successResponse,
} = require('../../utils/responseHandler');
const { statusCodes } = require('../../utils/statusCode');
const { successResponses } = require('./devices.constant');
const { getDeviceTypes } = require('./devices.helper');

exports.listDevicesTypes = async (req, res, next) => {
  try {
    const { success, errorCode, message, data } = await getDeviceTypes();
    if (!success) {
      return errorResponse({
        res,
        code: errorCode,
        message: message,
      });
    }
    return successResponse({
      res,
      data: {
        device_types: data,
      },
      message: successResponses.COUNT_FETCH_SUCCESSFULL.message,
      code: statusCodes.STATUS_CODE_SUCCESS,
    });
  } catch (err) {
    logger.error(err);
    return errorResponse({
      res,
      code: statusCodes.STATUS_CODE_FAILURE,
      error: err,
    });
  }
};
