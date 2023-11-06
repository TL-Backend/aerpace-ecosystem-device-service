const {
  getAllDevicesFromType,
  getCategoriesQuery,
  verifyActionsById,
  getValidActionsForVersion,
  getValidActionsForVariant,
  checkDeviceData,
  checkVariantData,
  getPersonalityPrivileges,
  checkModelData,
  getVersionData,
  getVariantData,
  getModelData,
} = require('./device.query');
const { statusCodes } = require('../../utils/statusCode');
const {
  errorResponses,
  successResponses,
  status,
} = require('./device.constant');
const {
  sequelize,
  Sequelize,
  aergov_device_versions,
  aergov_device_models,
  aergov_device_variants,
  aergov_device_actions,
  aergov_device_model_privileges,
} = require('../../services/aerpace-ecosystem-backend-db/src/databases/postgresql/models');
const { logger } = require('../../utils/logger');
const { eachLimitPromise } = require('../../utils/utility');
const { queries } = require('./device.query');
const { levelStarting } = require('../../utils/constant');

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
      where: { name, variant_id: variantId },
    });

    if (validateVersionName.length) {
      await transaction.rollback();
      return {
        success: false,
        message: errorResponses.NAME_EXISTS,
        errorCode: statusCodes.STATUS_CODE_INVALID_FORMAT,
        data: {},
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

    const { success, message, errorCode } = await this.addDeviceActions({
      modelId,
      variantId,
      versionId: addVersion.id,
      privileges,
      type,
    });

    if (!success) {
      await transaction.rollback();
      return {
        success: false,
        message,
        errorCode: errorCode,
        data: {},
      };
    }

    await transaction.commit();
    return { id: addVersion.id, success };
  } catch (err) {
    logger.error(err.message);
    await transaction.rollback();
    return {
      success: false,
      message: errorResponses.INTERNAL_ERROR,
      errorCode: statusCodes.STATUS_CODE_FAILURE,
      data: {},
    };
  }
};

exports.addDeviceActions = async ({
  modelId,
  variantId,
  versionId,
  privileges,
  type,
  dataValues,
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
        replacements: { actions: privilege.actions, type },
      });

      if (!actionsCheck[0][0].result) {
        isError.push('false');
        return;
      }

      let validActions = ``;

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
    });

    if (isError.length) {
      await transaction.rollback();
      return {
        success: false,
        message: errorResponses.IMPROPER_CATEGORY_OR_ACTIONS,
        errorCode: statusCodes.STATUS_CODE_DATA_NOT_FOUND,
        data: {},
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
      data: {},
    };
  }
};

const createDeviceVariant = async ({
  modelId,
  name,
  status,
  type,
  privileges,
}) => {
  const transaction = await sequelize.transaction();
  try {
    const validateVariantName = await aergov_device_variants.findAll({
      where: { name, model_id: modelId },
    });

    if (validateVariantName.length) {
      await transaction.rollback();
      return {
        success: false,
        message: errorResponses.NAME_EXISTS,
        errorCode: statusCodes.STATUS_CODE_INVALID_FORMAT,
        data: {},
      };
    }

    const addVariant = await aergov_device_variants.create(
      {
        name: name,
        model_id: modelId,
        device_type: type,
        status: status,
      },
      { transaction },
    );

    const { success, message } = await this.addDeviceActions({
      modelId,
      variantId: addVariant.id,
      privileges,
      type,
    });

    if (!success) {
      await transaction.rollback();
      return {
        success: false,
        message,
        errorCode: statusCodes.STATUS_CODE_INVALID_FORMAT,
        data: {},
      };
    }

    await transaction.commit();
    return { id: addVariant.id, success };
  } catch (err) {
    logger.error(err.message);
    await transaction.rollback();
    return {
      success: false,
      message: errorResponses.INTERNAL_ERROR,
      errorCode: statusCodes.STATUS_CODE_FAILURE,
      data: {},
    };
  }
};

const createDeviceModel = async ({ name, status, type, privileges }) => {
  const transaction = await sequelize.transaction();
  try {
    const validateModelName = await aergov_device_models.findAll({
      where: { name, device_type: type },
    });

    if (validateModelName.length) {
      await transaction.rollback();
      return {
        success: false,
        message: errorResponses.NAME_EXISTS,
        errorCode: statusCodes.STATUS_CODE_INVALID_FORMAT,
        data: {},
      };
    }

    const addModel = await aergov_device_models.create(
      {
        name: name,
        device_type: type,
        status: status,
      },
      { transaction },
    );

    const { success, message } = await this.addDeviceActions({
      modelId: addModel.id,
      privileges,
      type,
    });

    if (!success) {
      await transaction.rollback();
      return {
        success: false,
        message,
        errorCode: statusCodes.STATUS_CODE_INVALID_FORMAT,
        data: {},
      };
    }

    await transaction.commit();
    return { id: addModel.id, success };
  } catch (err) {
    logger.error(err.message);
    await transaction.rollback();
    return {
      success: false,
      message: errorResponses.INTERNAL_ERROR,
      errorCode: statusCodes.STATUS_CODE_FAILURE,
      data: {},
    };
  }
};

exports.addDeviceLevel = async (params) => {
  try {
    let device = {
      success: false,
      data: {},
      message: errorResponses.INTERNAL_ERROR,
      errorCode: statusCodes.STATUS_CODE_FAILURE,
    };
    const {
      model_id: modelId,
      variant_id: variantId,
      name,
      type,
      privileges,
    } = params;

    const deviceStatus = status.DRAFT;

    if (!modelId && variantId) {
      // const modelValidation = await aergov_device_models.findAll({
      //   where: { id: modelId },
      // });

      // if (!modelValidation.length) {
      //   return {
      //     success: false,
      //     errorCode: statusCodes.STATUS_CODE_INVALID_FORMAT,
      //     message: errorResponses.INVALID_MODEL,
      //     data: {},
      //   };
      // }

      const variantValidation = await aergov_device_variants.findAll({
        where: { id: variantId },
      });

      if (!variantValidation.length) {
        return {
          success: false,
          errorCode: statusCodes.STATUS_CODE_INVALID_FORMAT,
          message: errorResponses.INVALID_VARIANT,
          data: {},
        };
      }
      console.log(variantValidation[0].dataValues);
      device = await createDeviceVersion({
        modelId: variantValidation[0].dataValues.model_id,
        variantId,
        name,
        status: deviceStatus,
        type,
        privileges,
      });
    }

    if (modelId && !variantId) {
      const modelValidation = await aergov_device_models.findAll({
        where: { id: modelId },
      });

      if (!modelValidation.length) {
        return {
          success: false,
          errorCode: statusCodes.STATUS_CODE_INVALID_FORMAT,
          message: errorResponses.INVALID_MODEL,
          data: {},
        };
      }

      device = await createDeviceVariant({
        modelId,
        name,
        status: deviceStatus,
        type,
        privileges,
      });
    }

    if (!modelId && !variantId) {
      device = await createDeviceModel({
        name,
        status: deviceStatus,
        type,
        privileges,
      });
    }

    if (!device.success) {
      return {
        success: false,
        data: {},
        message: device.message,
        errorCode: device.errorCode,
      };
    }
    return {
      success: true,
      data: { id: device.id },
      message: successResponses.DEVICE_CREATED,
      errorCode: statusCodes.STATUS_CODE_SUCCESS,
    };
  } catch (err) {
    logger.error(err);
    return {
      success: false,
      data: {},
      message: errorResponses.INTERNAL_ERROR,
      errorCode: statusCodes.STATUS_CODE_FAILURE,
    };
  }
};

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
      message: successResponses.COUNT_FETCH_SUCCESSFULL,
      data: counts[0],
    };
  } catch (err) {
    logger.error(err);
    return {
      success: false,
      errorCode: statusCodes.STATUS_CODE_FAILURE,
      message: err.message,
      data: {},
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
      const validateVersions = await sequelize.query(checkDeviceData, {
        replacements: {
          model_id: modelId,
          variant_id: variantId,
          version_id: versionId,
        },
        type: sequelize.QueryTypes.SELECT,
      });
      if (!validateVersions[0].result) {
        await transaction.rollback();
        return {
          success: false,
          errorCode: statusCodes.STATUS_CODE_INVALID_FORMAT,
          message: errorResponses.UNABLE_TO_PERFORM_EDIT_OPERATION,
          data: {},
        };
      }
    }

    if (modelId && variantId && !versionId) {
      const validateDeviceVariant = await sequelize.query(checkVariantData, {
        replacements: {
          model_id: modelId,
          variant_id: variantId,
          version_id: versionId,
        },
        type: sequelize.QueryTypes.SELECT,
      });
      if (!validateDeviceVariant[0].result) {
        await transaction.rollback();
        return {
          success: false,
          errorCode: statusCodes.STATUS_CODE_INVALID_FORMAT,
          message: errorResponses.UNABLE_TO_PERFORM_EDIT_OPERATION,
          data: {},
        };
      }
    }

    if (modelId && !variantId && !versionId) {
      const validateDeviceVariant = await sequelize.query(checkModelData, {
        replacements: {
          model_id: modelId,
        },
        type: sequelize.QueryTypes.SELECT,
      });
      if (!validateDeviceVariant[0].result) {
        await transaction.rollback();
        return {
          success: false,
          errorCode: statusCodes.STATUS_CODE_INVALID_FORMAT,
          message: errorResponses.UNABLE_TO_PERFORM_EDIT_OPERATION,
          data: {},
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

    logger.info(successResponses.ENTRIES_DELETED_SUCCESSFUL);

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
        data: {},
      };
    }

    await transaction.commit();
    return {
      success: true,
      message: successResponses.DEVICES_EDITED_SUCCESSFULLY,
      data: {},
    };
  } catch (err) {
    await transaction.rollback();
    logger.error(err);
    return {
      success: false,
      message: err.message,
      errorCode: errorResponses.INTERNAL_ERROR,
      data: {},
    };
  }
};

exports.getPersonalityPrivilegesHelper = async ({ params }) => {
  try {
    const personalityData = await sequelize.query(getPersonalityPrivileges, {
      replacements: {
        model_id: params.model_id,
        variant_id: params.variant_id,
        version_id: params.version_id,
      },
    });
    const personalities = personalityData[0][0].personalities
      ? personalityData[0][0].personalities.forEach((currentItem) => {
          const privilegesList = currentItem.privileges
            ? Object.keys(currentItem.privileges).map((identifier) => ({
                ...currentItem.privileges[identifier],
              }))
            : [];
          currentItem.privileges = privilegesList;
        })
      : {};
    return {
      success: true,
      errorCode: statusCodes.STATUS_CODE_SUCCESS,
      message: successResponses.DATA_FETCH_SUCCESSFULL,
      data: {
        personalities: personalityData[0][0].personalities
          ? personalityData[0][0].personalities
          : [],
      },
    };
  } catch (err) {
    logger.error(err.message);
    return {
      success: false,
      errorCode: statusCodes.STATUS_CODE_FAILURE,
      message: errorResponses.INTERNAL_ERROR,
      data: {},
    };
  }
};

exports.getValidHierarchyHelper = async ({ id }) => {
  try {
    if (id.startsWith(levelStarting.VERSION)) {
      const versionData = await sequelize.query(getVersionData, {
        replacements: {
          id,
        },
      });
      if (versionData[0][0]) {
        return {
          success: true,
          data: versionData[0][0],
        };
      }
    } else if (id.startsWith(levelStarting.VARIANT)) {
      const variantData = await sequelize.query(getVariantData, {
        replacements: {
          id,
        },
      });
      if (variantData[0][0]) {
        return {
          success: true,
          data: variantData[0][0],
        };
      }
    } else if (id.startsWith(levelStarting.MODEL)) {
      const modelData = await sequelize.query(getModelData, {
        replacements: {
          id,
        },
      });
      if (modelData[0][0]) {
        return {
          success: true,
          data: modelData[0][0],
        };
      }
    }
    return {
      data: {
        type: null,
        model_name: null,
        variant_name: null,
        version_name: null,
      },
      success: false,
      errorCode: statusCodes.STATUS_CODE_DATA_NOT_FOUND,
      message: errorResponses.NO_DATA_FOUND,
    };
  } catch (err) {
    logger.error(err.message);
    return {
      success: false,
      errorCode: statusCodes.STATUS_CODE_FAILURE,
      message: errorResponses.INTERNAL_ERROR,
      data: {},
    };
  }
};
