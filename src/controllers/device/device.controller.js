const { logger } = require('../../utils/logger');
const {
  errorResponse,
  successResponse,
} = require('../../utils/responseHandler');
const { statusCodes } = require('../../utils/statusCode');
const {
  getDevicesDataHelper,
  getPersonalityPrivilegesHelper,
} = require('./device.helper');
const messages = require('./device.constant');
const { successResponses, errorResponses } = require('./device.constant');
const { getDeviceTypes } = require('./device.helper');

exports.getDevicesList = async (request, response) => {
  try {
    let devices = await getDevicesDataHelper({
      deviceType: request.params.device_type,
    });
    return successResponse({
      data: { devices: devices.data },
      req: request,
      res: response,
      message: messages.successResponses.DEVICES_FETCHED_MESSAGE,
      code: statusCodes.STATUS_CODE_SUCCESS,
    });
  } catch (error) {
    logger.error(error);
    return errorResponse({
      request,
      response,
      code: statusCodes.STATUS_CODE_FAILURE,
      message: error,
    });
  }
};

exports.listDevicesTypes = async (req, res, next) => {
  try {
    const { success, errorCode, message, data } = await getDeviceTypes();
    if (!success) {
      return errorResponse({
        req,
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
      message: successResponses.COUNT_FETCH_SUCCESSFULL,
      code: statusCodes.STATUS_CODE_SUCCESS,
    });
  } catch (err) {
    logger.error(err);
    return errorResponse({
      req,
      res,
      code: statusCodes.STATUS_CODE_FAILURE,
      error: errorResponses.INTERNAL_ERROR,
    });
  }
};

exports.getPersonalityDetails = async (req, res, next) => {
  try {
    const { success, errorCode, message, data } =
      await getPersonalityPrivilegesHelper({ params: req.query });
    if (!success) {
      return errorResponse({
        req,
        res,
        code: errorCode,
        message: message,
      });
    }
    return successResponse({
      res,
      data,
      message: successResponses.COUNT_FETCH_SUCCESSFULL,
      code: statusCodes.STATUS_CODE_SUCCESS,
    });
  } catch (err) {
    logger.error(err);
    return errorResponse({
      req,
      res,
      code: statusCodes.STATUS_CODE_FAILURE,
      error: errorResponses.INTERNAL_ERROR,
    });
  }
};
