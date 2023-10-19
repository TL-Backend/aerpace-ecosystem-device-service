const {
  getAllDevicesFromType,
  getCategoriesQuery,
  verifyActionsById,
  getValidActionsForVersion,
  getValidActionsForVariant,
  getModelData,
  getVariantData,
  getDeviceData,
} = require('./device.query');
const {
  sequelize,
  aergov_device_actions,
  aergov_device_model_privileges,
  aergov_device_versions,
  aergov_device_variants,
  aergov_device_models,
} = require('../../services/aerpace-ecosystem-backend-db/src/databases/postgresql/models');
const { logger } = require('../../utils/logger');
const { statusCodes } = require('../../utils/statusCode');
const { successResponses, errorResponses } = require('./device.constant');
const { queries } = require('./device.query');
const { eachLimitPromise } = require('../../utils/utility');

exports.getDevicesDataHelper = async ({ deviceType }) => {
  try {
    const devicesQueryResult = await sequelize.query(getAllDevicesFromType, {
      replacements: {
        device_type: deviceType,
      },
    });
    return {
      success: true,
      data: devicesQueryResult[0][0].data,
    };
  } catch (error) {
    return {
      success: false,
      data: error,
    };
  }
};

exports.getDeviceTypes = async () => {
  try {
    const counts = await sequelize.query(queries.getDeviceCount);
    return {
      success: true,
      message: successResponses.DATA_FETCH_SUCCESSFULL,
      data: counts[0],
    };
  } catch (err) {
    logger.error(err);
    return {
      success: false,
      errorCode: statusCodes.STATUS_CODE_FAILURE,
      message: err.message,
      data: null,
    };
  }
};

exports.editDevicesHelper = async (params) => {
  const transaction = await sequelize.transaction();
  try {
    let {
      model_id: modelId = null,
      variant_id: variantId = null,
      version_id: versionId = null,
      privileges,
      type,
    } = params;

    if (modelId && variantId && versionId) {
      const validateVersions = await sequelize.query(getDeviceData, {
        replacements: {
          model_id: modelId,
          variant_id: variantId,
          version_id: versionId,
        },
        type: sequelize.QueryTypes.SELECT,
      });
      console.log(validateVersions);
      if (!validateVersions[0].result) {
        return {
          success: false,
          errorCode: statusCodes.STATUS_CODE_INVALID_FORMAT,
          message: errorResponses.UNABLE_TO_PERFOM_EDIT_OPERATION,
          data: null,
        };
      }
    }

    if (modelId && variantId && !versionId) {
      const validateDeviceVariant = await sequelize.query(getVariantData, {
        replacements: {
          model_id: modelId,
          variant_id: variantId,
          version_id: versionId,
        },
        type: sequelize.QueryTypes.SELECT,
      });
      if (!validateDeviceVariant[0].result) {
        return {
          success: false,
          errorCode: statusCodes.STATUS_CODE_INVALID_FORMAT,
          message: errorResponses.UNABLE_TO_PERFOM_EDIT_OPERATION,
          data: null,
        };
      }
    }

    if (modelId && !variantId && !versionId) {
      const validateDeviceVariant = await sequelize.query(getModelData, {
        replacements: {
          model_id: modelId,
        },
        type: sequelize.QueryTypes.SELECT,
      });
      console.log(validateDeviceVariant[0].result);
      if (!validateDeviceVariant[0].result) {
        return {
          success: false,
          errorCode: statusCodes.STATUS_CODE_INVALID_FORMAT,
          message: errorResponses.UNABLE_TO_PERFOM_EDIT_OPERATION,
          data: null,
        };
      }
    }

    await aergov_device_actions.destroy(
      {
        where: {
          model_id: modelId,
          variant_id: variantId,
          version_id: versionId,
        },
      },
      { transaction },
    );

    const { success, message, errorCode } = await this.addDeviceActions({
      modelId,
      variantId,
      versionId,
      privileges,
      type,
    });
    if (!success) {
      await transaction.rollback();
      return {
        success: false,
        message,
        errorCode: errorCode,
        data: null,
      };
    }

    await transaction.commit();
    return {
      success: true,
      message: successResponses.DEVICES_EDITED_SUCCESSFULLY,
      data: null,
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

exports.addDeviceActions = async ({
  modelId,
  variantId,
  versionId,
  privileges,
  type,
}) => {
  const transaction = await sequelize.transaction();
  try {
    let isError = [];
    let validActions = ``;
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

      if (versionId && variantId && modelId) {
        const validActionsQuery = getValidActionsForVersion;
        let aValidActions = await sequelize.query(validActionsQuery, {
          replacements: {
            actions: privilege.actions,
            model_id: modelId,
            variant_id: variantId,
            version_id: versionId,
          },
          raw: true,
        });
        validActions = aValidActions[0][0].array;
      }
      if (variantId && modelId && !versionId) {
        const validActionsQuery = getValidActionsForVariant;
        let aValidActions = await sequelize.query(validActionsQuery, {
          replacements: {
            actions: privilege.actions,
            model_id: modelId,
            variant_id: variantId,
            version_id: versionId,
          },
          raw: true,
        });
        validActions = aValidActions[0][0].array;
      }
      if (modelId && !variantId && !versionId) {
        validActions = privilege.actions;
      }

      if (validActions.length) {
        for (const action of validActions) {
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
      }
    });
    if (!validActions.length) {
      return {
        success: false,
        message: errorResponses.NO_VALID_ACTIONS_TO_UPDATE,
        errorCode: statusCodes.STATUS_CODE_INVALID_FORMAT,
        data: null,
      };
    }

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
      message: successResponses.DEVICES_EDITED_SUCCESSFULLY,
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

exports.deleteDeviceActionEntries = async ({
  modelId,
  variantId,
  versionId,
  transaction,
}) => {
  try {
    await aergov_device_actions.destroy(
      {
        where: {
          model_id: modelId,
          variant_id: variantId,
          version_id: versionId,
        },
      },
      { transaction },
    );
    return {
      success: true,
      data: null,
    };
  } catch (err) {
    await transaction.rollback();
    logger.error(err);
    return {
      success: false,
      errorCode: statusCodes.STATUS_CODE_FAILURE,
      message: err.message,
      data: null,
    };
  }
};

exports.createDeviceEntries = async (params) => {
  try {
    let {
      model_id: modelId = null,
      variant_id: variantId = null,
      version_id: versionId = null,
      type,
      privileges,
    } = params;
    const entries = [];
    privileges.forEach((privilege) => {
      const category_id = privilege.category_id;
      const actions = privilege.actions;

      actions.forEach((action_id) => {
        const entry = {
          model_id: modelId,
          variant_id: variantId,
          version_id: versionId,
          action_id,
          category_id,
          device_type: type,
        };
        entries.push(entry);
      });
    });

    const editedData = await aergov_device_actions.bulkCreate(entries);
    return {
      success: true,
      data: editedData,
      message: successResponses.DEVICES_EDITED_SUCCESSFULLY,
    };
  } catch (err) {
    logger.error(err);
    return {
      success: false,
      errorCode: statusCodes.STATUS_CODE_FAILURE,
      message: err.message,
      data: null,
    };
  }
};
