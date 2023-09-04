const { logger } = require('../../utils/logger');
const {
  errorResponse,
  successResponse,
} = require('../../utils/responseHandler');
const { statusCodes } = require('../../utils/statusCodes');
const { successResponses, errorResponses } = require('./devices.constants');
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
    if (data) {
      return successResponse({
        res,
        data: {
          device_types: data,
        },
        message: successResponses.COUNT_FETCH_SUCCESSFULL.message,
        code: statusCodes.STATUS_CODE_SUCCESS,
      });
    }
    return successResponse({
      res,
      data: {},
      message: successResponses.NO_DATA_FOUND.message,
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
