const { successResponse } = require('../../utils/responseHandler');
const { statusCodes } = require('../../utils/statusCode');
const { errorResponses, successResponses } = require('./device.constant');
const {
  sequelize,
  aergov_device_versions,
  aergov_device_actions,
  aergov_device_models,
  aergov_device_variants,
} = require('../../services/aerpace-ecosystem-backend-db/src/databases/postgresql/models');
const { logger } = require('../../utils/logger');
const { verifyActionsById, getCategoriesQuery } = require('./device.query');
const { eachLimitPromise } = require('../../utils/utility');

const createDeviceVersion = async ({
  modelId,
  variantId,
  name,
  status,
  type,
  privileges,
}) => {
  const transaction = await sequelize.transaction();
  try {
    const validateVersionName = await aergov_device_versions.findAll({
      where: { name },
    });

    if (validateVersionName.length) {
      await transaction.rollback();
      return {
        success: false,
        message: errorResponses.NAME_EXISTS,
        errorCode: statusCodes.STATUS_CODE_INVALID_FORMAT,
        data: null,
      };
    }

    const addVersion = await aergov_device_versions.create(
      {
        name: name,
        model_id: modelId,
        variant_id: variantId,
        device_type: type,
        status: status,
      },
      { transaction },
    );

    const { success, message } = await addDeviceActions({
      modelId,
      variantId,
      versionId: addVersion.id,
      privileges,
      type,
    }); // device actions addition logic

    if (!success) {
      await transaction.rollback();
      return {
        success: false,
        message,
        errorCode: statusCodes.STATUS_CODE_INVALID_FORMAT,
        data: null,
      };
    }

    await transaction.commit();
    return { versionId: addVersion.id, success };
  } catch (err) {
    logger.error(err.message);
    await transaction.rollback();
    return {
      success: false,
      message: errorResponses.INTERNAL_ERROR,
      errorCode: statusCodes.STATUS_CODE_FAILURE,
      data: null,
    };
  }
};

const addDeviceActions = async ({
  modelId,
  variantId,
  versionId,
  privileges,
  type,
}) => {
  const transaction = await sequelize.transaction();
  try {
    let isError = [];
    await eachLimitPromise(privileges, 10, async (privilege) => {
      const categories = await sequelize.query(getCategoriesQuery, {
        replacements: { id: privilege.category_id },
      });

      if (!categories[0].length) {
        isError.push('false');
        return;
      }

      const actionsCheck = await sequelize.query(verifyActionsById, {
        replacements: { actions: privilege.actions },
      });

      if (!actionsCheck[0][0].result) {
        isError.push('false');
        return;
      }

      for (const action of privilege.actions) {
        await aergov_device_actions.create(
          {
            ...(modelId && { model_id: modelId }),
            ...(variantId && { variant_id: variantId }),
            ...(versionId && { version_id: versionId }),
            action_id: action,
            category_id: privilege.category_id,
            device_type: type,
          },
          { transaction },
        );
      }
    });

    if (isError.length) {
      await transaction.rollback();
      return {
        success: false,
        message: errorResponses.IMPROPER_CATEGORY_OR_ACTIONS,
        errorCode: statusCodes.STATUS_CODE_DATA_NOT_FOUND,
        data: null,
      };
    }

    await transaction.commit();

    return {
      success: true,
      message: successResponses.ACTIONS_ADDED,
    };
  } catch (err) {
    await transaction.rollback();
    logger.error(err);
    return {
      success: false,
      message: err.message,
      errorCode: errorResponses.INTERNAL_ERROR,
      data: null,
    };
  }
};

exports.addDeviceLevel = async (params) => {
  try {
    let device = {
      success: false,
      data: null,
      message: errorResponses.INTERNAL_ERROR,
      errorCode: statusCodes.STATUS_CODE_FAILURE,
    };
    const {
      model_id: modelId,
      variant_id: variantId,
      name,
      status,
      type,
      privileges,
    } = params;

    if (modelId && variantId) {
      const modelValidation = await aergov_device_models.findAll({
        where: { id: modelId },
      });

      if (!modelValidation.length) {
        return {
          success: false,
          errorCode: statusCodes.STATUS_CODE_INVALID_FORMAT,
          message: errorResponses.INVALID_MODEL,
          data: null,
        };
      }

      const variantValidation = await aergov_device_variants.findAll({
        where: { id: variantId },
      });

      if (!variantValidation.length) {
        return {
          success: false,
          errorCode: statusCodes.STATUS_CODE_INVALID_FORMAT,
          message: errorResponses.INVALID_VARIANT,
          data: null,
        };
      }

      device = await createDeviceVersion({
        modelId,
        variantId,
        name,
        status,
        type,
        privileges,
      });
    }

    if (!device.success) {
      return {
        success: false,
        data: null,
        message: device.message,
        errorCode: device.errorCode,
        data: null,
      };
    }
    return {
      success: true,
      data: { version_id: device.versionId },
      message: successResponses.DEVICE_CREATED,
      errorCode: statusCodes.STATUS_CODE_SUCCESS,
    };
  } catch (err) {
    logger.error(err);
    return {
      success: false,
      data: null,
      message: errorResponses.INTERNAL_ERROR,
      errorCode: statusCodes.STATUS_CODE_FAILURE,
    };
  }
};
