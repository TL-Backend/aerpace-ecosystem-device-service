const { levelStarting } = require('../../utils/constant');
const { logger } = require('../../utils/logger');
const { errorResponse } = require('../../utils/responseHandler');
const { statusCodes } = require('../../utils/statusCode');
const { errorResponses } = require('./privilege.constant');
const {
  constants,
} = require('../../services/aerpace-ecosystem-backend-db/src/commons/constant');

exports.validateAddPersonalityPrivileges = async (req, res, next) => {
  try {
    const {
      type,
      model_id: modelId,
      variant_id: variantId,
      version_id: versionId,
      privileges,
    } = req.body;
    let errorList = [];

    if (
      !type ||
      typeof type !== 'string' ||
      !constants.DEVICE_TYPES.includes(type)
    ) {
      errorList.push(errorResponses.INVALID_DEVICE_TYPE('type'));
    }
    if (
      !modelId ||
      typeof modelId !== 'string' ||
      !modelId.startsWith(levelStarting.MODEL)
    ) {
      errorList.push(errorResponses.INVALID_LEVEL_ID('MODEL'));
    }
    if (
      !variantId ||
      typeof variantId !== 'string' ||
      !variantId.startsWith(levelStarting.VARIANT)
    ) {
      errorList.push(errorResponses.INVALID_LEVEL_ID('VARIANT'));
    }
    if (
      !versionId ||
      typeof versionId !== 'string' ||
      !versionId.startsWith(levelStarting.VERSION)
    ) {
      errorList.push(errorResponses.INVALID_LEVEL_ID('VERSION'));
    }
    if (!privileges || typeof privileges !== 'object') {
      errorList.push(
        errorResponses.INVALID_OBJECT_OR_MISSING_ERROR('privileges'),
      );
    }

    if (privileges) {
      let errors = [];
      privileges.forEach((privilege) => {
        if (!constants.PERSONALITIES.includes(privilege.personality)) {
          errors.push(
            errorResponses.INVALID_PERSONALITY(privilege.personality),
          );
        }

        if (!privilege.actions || typeof privilege.actions !== 'object') {
          errors.push(errorResponses.INVALID_ACTIONS(privilege.personality));
        }
      });

      if (errors.length) {
        errorList.push(...new Set(errors));
      }
    }

    if (errorList.length) {
      throw errorList.join(', ');
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

exports.listDevicePrivilegesValidation = async (req, res, next) => {
  try {
    const { version_id: versionId } = req.query;
    if (
      !versionId ||
      typeof versionId !== 'string' ||
      !versionId.startsWith(levelStarting.version)
    ) {
      throw errorResponses.INVALID_DEVICE_ID('version');
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
