const { errorResponses } = require('./devices.constants');
const { logger } = require('../../utils/logger');
const { errorResponse } = require('../../utils/responseHandler');
const { statusCodes } = require('../../utils/statusCodes');

exports.validateDeviceInput = async (req, res, next) => {
  try {
    const {
      name,
      privileges,
      model_id = null,
      variant_id = null,
      status,
      type,
    } = req.body;
    const errorsList = [];

    if (!name || typeof name !== 'string') {
      errorsList.push(errorResponses.INVALID_STRING_OR_MISSING_ERROR('name'));
    }

    if (model_id && typeof model_id !== 'string') {
      errorsList.push(
        errorResponses.INVALID_STRING_OR_MISSING_ERROR('model_id'),
      );
    }

    if (variant_id && typeof variant_id !== 'string') {
      errorsList.push(
        errorResponses.INVALID_STRING_OR_MISSING_ERROR('variant_id'),
      );
    }

    if (!status || typeof status !== 'string') {
      errorsList.push(errorResponses.INVALID_STRING_OR_MISSING_ERROR('status'));
    }

    if (!type || typeof type !== 'string') {
      errorsList.push(errorResponses.INVALID_STRING_OR_MISSING_ERROR('type'));
    }

    if (!privileges || typeof privileges !== 'object') {
      errorsList.push(
        errorResponses.INVALID_STRING_OR_MISSING_ERROR('privileges'),
      );
    }

    if (privileges) {
      privileges.map((privilege) => {
        if (privilege) {
          if (!privilege.category_id) {
            errorsList.push(errorResponses.INVALID_CATEGORY_ID);
          }

          if (!privilege.actions || typeof privilege.actions !== 'object') {
            errorsList.push(errorResponses.INVALID_ACTIONS);
          }
        }
      });
    }

    if (errorsList.length) {
      throw errorsList.join(' ,');
    }

    return next();
  } catch (error) {
    logger.error(error);
    return errorResponse({
      req,
      res,
      error,
      message: error,
      code: statusCodes.STATUS_CODE_INVALID_FORMAT,
    });
  }
};
