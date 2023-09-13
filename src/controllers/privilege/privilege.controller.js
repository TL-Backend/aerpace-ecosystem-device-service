const { logger } = require('../../utils/logger');
const {
  errorResponse,
  successResponse,
} = require('../../utils/responseHandler');
const { statusCodes } = require('../../utils/statusCode');
const { errorResponses, successResponses } = require('./privilege.constant');
const { listDeviceLevelPrivileges } = require('./privilege.helper');

exports.getDeviceLevelPrivileges = async (req, res, next) => {
  try {
    const { version_id: versionId } = req.query;
    let { success, errorCode, message, data } = await listDeviceLevelPrivileges(
      { versionId },
    );
    if (!success) {
      return errorResponse({
        req,
        res,
        code: errorCode,
        message,
      });
    }
    return successResponse({
      res,
      data,
      message,
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
