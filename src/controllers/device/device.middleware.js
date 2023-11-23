const { errorResponses, deviceTypes } = require('./device.constant');
const { logger } = require('../../utils/logger');
const { errorResponse } = require('../../utils/responseHandler');
const { statusCodes } = require('../../utils/statusCode');
const { levelStarting } = require('../../utils/constant');

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
};

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
    let errorsList = [];

    if (modelId && (typeof modelId !== 'string' || !modelId.startsWith('m_'))) {
      errorsList.push(errorResponses.INVALID_MODEL_ID_TYPE);
    }
    const { error, errorsList: errorList } =
      this.validateAddAndEditCommonInputs({
        errorsList,
        modelId,
        variantId,
        status,
        type,
        name,
        privileges,
      });
    if (error) {
      throw error;
    }
    errorsList = errorList;

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

exports.validateEditDeviceInput = async (req, res, next) => {
  try {
    const {
      name,
      privileges,
      model_id: modelId = null,
      variant_id: variantId = null,
      version_id: versionId = null,
      status,
      type,
    } = req.body;
    let errorsList = [];

    if (!modelId && !variantId && !versionId) {
      errorsList.push(errorResponses.NO_DEVICE_INPUT);
    }

    if (modelId && (typeof modelId !== 'string' || !modelId.startsWith('m_'))) {
      errorsList.push(errorResponses.INVALID_MODEL_ID_TYPE);
    }

    const { error, errorsList: errorList } =
      this.validateAddAndEditCommonInputs({
        errorsList,
        modelId,
        variantId,
        status,
        type,
        name,
        privileges,
      });
    if (error) {
      throw error;
    }
    errorsList = errorList;

    if (
      versionId &&
      (typeof versionId !== 'string' || !versionId.startsWith('ver_'))
    ) {
      errorsList.push(errorResponses.INVALID_VERSION_ID_TYPE);
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
      message: errorResponses.SOMETHING_WENT_WRONG,
      code: statusCodes.STATUS_CODE_INVALID_FORMAT,
    });
  }
};

exports.validateAddAndEditCommonInputs = ({
  errorsList,
  modelId,
  variantId,
  type,
  name,
  privileges,
}) => {
  try {
    if (!name && typeof name !== 'string') {
      errorsList.push(errorResponses.INVALID_STRING_OR_MISSING_ERROR('name'));
    }

    if (
      variantId &&
      (typeof variantId !== 'string' || !variantId.startsWith('va_'))
    ) {
      errorsList.push(errorResponses.INVALID_VARIANT_ID_TYPE);
    }

    if (!type || typeof type !== 'string' || type !== deviceTypes.CAR) {
      errorsList.push(errorResponses.MISSING_INVALID_DEVICE_TYPE);
    }

    if (!privileges || typeof privileges !== 'object') {
      errorsList.push(errorResponses.INVALID_PRIVILEGES);
    }

    if (privileges) {
      let errors = [];
      privileges.forEach((privilege) => {
        if (privilege) {
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
        logger.error(errors);
        errorsList.push(...new Set(errors));
      }
    }
    return {
      errorsList,
    };
  } catch (err) {
    logger.error(err);
    return {
      error: err,
    };
  }
};

exports.validateGetPersonalityPrivilegesInput = async (req, res, next) => {
  try {
    const { model_id, variant_id, version_id } = req.query;
    let errorList = [];
    if (
      !model_id ||
      typeof model_id !== 'string' ||
      !model_id.startsWith(levelStarting.MODEL)
    ) {
      errorList.push(errorResponses.MODEL_ID_INVALID);
    }
    if (
      !variant_id ||
      typeof variant_id !== 'string' ||
      !variant_id.startsWith(levelStarting.VARIANT)
    ) {
      errorList.push(errorResponses.VARIANT_ID_INVALID);
    }
    if (
      !version_id ||
      typeof version_id !== 'string' ||
      !version_id.startsWith(levelStarting.VERSION)
    ) {
      errorList.push(errorResponses.VERSION_ID_INVALID);
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
      message: err,
      code: statusCodes.STATUS_CODE_INVALID_FORMAT,
    });
  }
};
