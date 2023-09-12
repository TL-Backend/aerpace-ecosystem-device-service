const { errorResponses } = require('./privilege.constant');
const { logger } = require('../../utils/logger');
const { errorResponse } = require('../../utils/responseHandler');
const { statusCodes } = require('../../utils/statusCode');
const {
  constants,
} = require('../../services/aerpace-ecosystem-backend-db/src/commons/constant');

exports.listMasterPrivilegesValidation = async (req, res, next) => {
  try {
    const errorsList = [];
    const { type, model_id: modelId, variant_id: variantId } = req.query;

    if (
      !type ||
      typeof type !== 'string' ||
      !constants.DEVICE_TYPES.includes(type.trim())
    ) {
      errorsList.push(errorResponses.INVALID_TYPE);
    }
    if (modelId && (typeof modelId !== 'string' || !modelId.startsWith('m_'))) {
      errorsList.push(errorResponses.INVALID_MODEL_ID);
    }
    if (
      variantId &&
      (typeof variantId !== 'string' ||
        !variantId.startsWith('va_') ||
        !modelId)
    ) {
      errorsList.push(errorResponses.INVALID_VARIANT_ID);
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
