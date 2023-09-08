const {errorResponses} = require('./device.constant');
const {logger} = require('../../utils/logger');
const {errorResponse} = require('../../utils/responseHandler');
const {statusCodes} = require('../../utils/statusCodes');
const {errorMessages} = require('./device.constant');
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
}
