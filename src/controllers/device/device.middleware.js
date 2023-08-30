const { logger } = require('../../utils/logger');
const { errorResponse } = require('../../utils/responseHandler');
const { statusCodes } = require('../../utils/statusCodes');
const { errorMessages } = require('./device.constants');
exports.validateGetDevicesTypeInput = async (request, response, next) => {
  try {
    const deviceType = request.params.device_type; // TODO: @Bharath change the device_type to constants in DB repo
    if (deviceType?.trim().isEmpty || typeof deviceType !== 'string') {
      throw errorMessages.INVALID_DEVICE_TYPE(deviceType);
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
