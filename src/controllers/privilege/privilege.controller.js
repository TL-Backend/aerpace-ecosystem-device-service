const { logger } = require('../../utils/logger');
const {
  successResponse,
  errorResponse,
} = require('../../utils/responseHandler');
const { statusCodes } = require('../../utils/statusCode');
const { errorResponses } = require('./privilege.constant');
const { listMasterPrivileges } = require('./privilege.helper');

exports.listMasterPrivileges = async (req, res, next) => {
  try {
    let { type, model_id: modelId, variant_id: variantId } = req.query;

    let { success, errorCode, message, data } = await listMasterPrivileges({
      type,
      modelId,
      variantId,
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
