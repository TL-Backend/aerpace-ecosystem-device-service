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
    const deviceType = request.params.device_type; // TODO: @Bharath change the device_type to constants in DB repo
    let devices = await getDevicesDataHelper(deviceType);
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
