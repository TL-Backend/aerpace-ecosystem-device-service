const { logger } = require('../../utils/logger');
const {
  successResponse,
  errorResponse,
} = require('../../utils/responseHandler');
const { statusCodes } = require('../../utils/statusCode');
const {
  addPrivilegesToPersonality,
  listDeviceLevelPrivileges,
  listMasterPrivileges,
} = require('./privilege.helper');
const { errorResponses } = require('./privilege.constant');

exports.addPersonalityPrivileges = async (req, res, next) => {
  try {
    const { errorCode, message, data, success } =
      await addPrivilegesToPersonality(req.body);
    if (!success) {
      return errorResponse({
        req,
        res,
        code: errorCode,
        message,
      });
    }

    return successResponse({
      req,
      res,
      data,
      message,
    });
  } catch (err) {
    logger.error(err.message);
    return errorResponse({
      req,
      res,
      code: statusCodes.STATUS_CODE_FAILURE,
      message: err.message,
    });
  }
};

exports.getDeviceLevelPrivileges = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { success, errorCode, message, data } = await listDeviceLevelPrivileges(
      { id },
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

exports.listMasterPrivileges = async (req, res, next) => {
  try {
    let { type, id } = req.query;

    let { success, errorCode, message, data } = await listMasterPrivileges({
      type,
      id,
    });
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
      data: {
        master_privileges: data,
      },
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
