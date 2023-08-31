const { successResponse } = require('../../utils/responseHandler');
const { statusCodes } = require('../../utils/statusCodes');
const { errorResponses, successResponses } = require('./devices.constants');
const {
  sequelize,
  aergov_device_versions,
  aergov_device_actions,
  aergov_device_models,
  aergov_device_variants,
} = require('../../services/aerpace-ecosystem-backend-db/src/databases/postgresql/models');
const { logger } = require('../../utils/logger');
const { verifyActionsById, getCategoriesQuery } = require('./devices.queries');
const { eachLimitPromise } = require('../../utils/utilities');

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
    const versionWithName = await aergov_device_versions.findAll({
      where: { name },
    });

    if (versionWithName.length > 0) {
      return {
        success: false,
        message: errorResponses.NAME_EXISTS,
        code: statusCodes.STATUS_CODE_INVALID_FORMAT,
      };
    }

    const addVersion = await aergov_device_versions
      .create(
        {
          name: name,
          model_id: modelId,
          variant_id: variantId,
          device_type: type,
          status: status,
        },
        { transaction },
      )
      .then((data) => {
        return data;
      })
      .catch((err) => {
        logger.error(err);
        return err;
      });
    const version_id = addVersion.id;

    const { success, message } = await addDeviceActions({
      modelId,
      variantId,
      version_id,
      privileges,
      type,
    }); // device actions addition logic

    if (!success) {
      await transaction.rollback();
      return {
        success: false,
        message,
        code: statusCodes.STATUS_CODE_INVALID_FORMAT,
      };
    }

    await transaction.commit();
    return { version_id, success };
  } catch (err) {
    await transaction.rollback();
    return {
      success: false,
      message: errorResponses.INTERNAL_ERROR,
      code: statusCodes.STATUS_CODE_FAILURE,
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

      if (categories[0].length < 1) {
        isError.push('false');
        return;
      }

      const actionsCheck = await sequelize.query(verifyActionsById, {
        replacements: { actions: privilege.actions },
      });

      if (actionsCheck[0][0].result === false) {
        isError.push('false');
        return;
      }

      for (const action of privilege.actions) {
        await aergov_device_actions
          .create(
            {
              ...(modelId && { model_id: modelId }),
              ...(variantId && { variant_id: variantId }),
              ...(versionId && { version_id: versionId }),
              action_id: action,
              category_id: privilege.category_id,
              device_type: type,
            },
            { transaction },
          )
          .then((data) => {
            return data;
          })
          .catch((err) => {
            isError.push(err);
            throw err;
          });
      }
    });

    if (isError.length > 0) {
      await transaction.rollback();
      return {
        success: false,
        message: errorResponses.IMPROPER_CATEGORY_OR_ACTIONS,
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
      message: errorResponses.INTERNAL_ERROR,
    };
  }
};

exports.addDevices = async (params) => {
  try {
    let device;
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

      if (modelValidation.length < 1) {
        return {
          success: false,
          code: statusCodes.STATUS_CODE_INVALID_FORMAT,
          message: errorResponses.INVALID_MODEL,
        };
      }

      const variantValidation = await aergov_device_variants.findAll({
        where: { id: variantId },
      });

      if (variantValidation.length < 1) {
        return {
          success: false,
          code: statusCodes.STATUS_CODE_INVALID_FORMAT,
          message: errorResponses.INVALID_VARIANT,
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
        code: device.code,
      };
    }
    return {
      success: true,
      data: { version_id: device.version_id },
      message: successResponses.DEVICE_CREATED,
      code: statusCodes.STATUS_CODE_SUCCESS,
    };
  } catch (err) {
    logger.error(err);
    return {
      success: false,
      data: null,
      message: errorResponses.INTERNAL_ERROR,
      code: statusCodes.STATUS_CODE_FAILURE,
    };
  }
};
