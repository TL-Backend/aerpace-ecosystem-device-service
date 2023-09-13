const { levelStarting } = require('../../utils/constant');
const { logger } = require('../../utils/logger');
const { errorResponse } = require('../../utils/responseHandler');
const { statusCodes } = require('../../utils/statusCode');
const { errorResponses } = require('./privilege.constant');

exports.listDevicePrivilegesValidation = async (req, res, next) => {
  try {
    const errorsList = [];
    const { version_id: versionId } = req.query;
    if (
      !versionId ||
      typeof versionId !== 'string' ||
      !versionId.startsWith(levelStarting.version)
    ) {
      errorsList.push(errorResponses.INVALID_ID('version'));
    }
    if (errorsList.length) {
      throw errorsList.join(', ');
    }
    return next();
  } catch (err) {
    logger.error(err);
    return errorResponse({
      req,
      res,
      err,
      message: err,
      code: statusCodes.STATUS_CODE_INVALID_FORMAT,
    });
  }
};
