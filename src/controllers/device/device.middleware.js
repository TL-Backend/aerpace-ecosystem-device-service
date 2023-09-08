const { errorResponses } = require('./device.constant');
const { logger } = require('../../utils/logger');
const { errorResponse } = require('../../utils/responseHandler');
const { statusCodes } = require('../../utils/statusCode');
const {
  constants,
} = require('../../services/aerpace-ecosystem-backend-db/src/commons/constants');

exports.validateDeviceInput = async (req, res, next) => {
  try {
    const {
      name,
      privileges,
      model_id: modelId = null,
      variant_id: variantId = null,
      status,
      type,
    } = req.body;
    const errorsList = [];

    if (!name || typeof name !== 'string') {
      errorsList.push(errorResponses.INVALID_STRING_OR_MISSING_ERROR('name'));
    }

    if (modelId && (typeof modelId !== 'string' || !modelId.startsWith('m_'))) {
      errorsList.push(errorResponses.INVALID_MODEL_ID_TYPE);
    }

    if (variantId && !modelId) {
      errorsList.push(errorResponses.MODEL_ID_MISSING);
    }

    if (
      variantId &&
      (typeof variantId !== 'string' || !variantId.startsWith('va_'))
    ) {
      errorsList.push(errorResponses.INVALID_VARIANT_ID_TYPE);
    }

    if (
      !status ||
      typeof status !== 'string' ||
      !constants.device_status.includes(status)
    ) {
      errorsList.push(errorResponses.INVALID_STRING_OR_MISSING_ERROR('status'));
    }

    if (
      !type ||
      typeof type !== 'string' ||
      !constants.device_types.includes(type)
    ) {
      errorsList.push(errorResponses.INVALID_STRING_OR_MISSING_ERROR('type'));
    }

    if (!privileges || typeof privileges !== 'object') {
      errorsList.push(
        errorResponses.INVALID_STRING_OR_MISSING_ERROR('privileges'),
      );
    }

    if (privileges) {
      let errors = [];
      privileges.forEach((privilege) => {
        if (privilege) {
          console.log(privilege);
          if (
            !privilege.category_id ||
            typeof privilege.category_id !== 'number'
          ) {
            errors.push(errorResponses.INVALID_CATEGORY_ID);
          }

          if (!privilege.actions || typeof privilege.actions !== 'object') {
            errors.push(errorResponses.INVALID_ACTIONS);
          }
        }
      });

      if (errors.length) {
        console.log(errors);
        errorsList.push(...new Set(errors));
      }
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
      error: err,
      message: err,
      code: statusCodes.STATUS_CODE_INVALID_FORMAT,
    });
  }
};
