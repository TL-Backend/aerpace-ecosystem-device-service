const { logger } = require('../../utils/logger');
const {
  errorResponse,
  successResponse,
} = require('../../utils/responseHandler');
const { statusCodes } = require('../../utils/statusCodes');
const { getDevicesDataHelper } = require('./device.helper');
const messages = require('./device.constants');

exports.getDevicesList = async (request, response) => {
  try {
    let devices = await getDevicesDataHelper({
      deviceType: request.params.device_type,
    });
    return successResponse({
      data: { devices: devices.data },
      req: request,
      res: response,
      message: messages.successMessages.DEVICES_FETCHED_MESSAGE,
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
