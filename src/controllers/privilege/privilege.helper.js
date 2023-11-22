const { logger } = require('../../utils/logger');
const { HelperResponse } = require('../../utils/response');
const { statusCodes } = require('../../utils/statusCode');
const { successResponses, errorResponses } = require('./privilege.constant');
const {
  sequelize,
  aergov_device_versions,
  aergov_device_model_privileges,
} = require('../../services/aerpace-ecosystem-backend-db/src/databases/postgresql/models');
const {
  getPrivileges,
  filterConditionQuery,
  getDevicePrivileges,
  validateActionIds,
  getActions,
  modelVariantVersionDataQuery,
} = require('./privilege.query');
const { status } = require('../device/device.constant');

exports.addPrivilegesToPersonality = async (params) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      model_id: modelId,
      variant_id: variantId,
      version_id: versionId,
      privileges,
    } = params;

    const {
      success,
      data: groupedPrivileges,
      message,
    } = this.groupPrivileges(privileges);
    if (!success) {
      await transaction.rollback();
      return new HelperResponse({
        success: false,
        message,
        errorCode: statusCodes.STATUS_CODE_INVALID_FORMAT,
      });
    }

    const {
      success: validateSuccess,
      data: validateData,
      errorCode: validateErrorCode,
      message: validateMessage,
    } = await this.validateModelVariantVersionId({
      modelId,
      variantId,
      versionId,
    });

    if (!validateSuccess) {
      await transaction.rollback();
      return new HelperResponse({
        success: false,
        message: validateMessage,
        errorCode: validateErrorCode,
      });
    }

    validateData.privileges = groupedPrivileges;

    let personalities = [];
    let effectedPersonalities = [];
    let error = false;
    let errorResponse = {};
    let personalityExists;
    for (
      let privilegeIndex = 0;
      privilegeIndex < groupedPrivileges?.length;
      privilegeIndex++
    ) {
      let personality = {
        model_id: modelId,
        variant_id: variantId,
        version_id: versionId,
      };

      personality['user_type'] = groupedPrivileges[privilegeIndex].personality;

      personalityExists = await aergov_device_model_privileges.findOne({
        where: {
          user_type: personality['user_type'],
          model_id: modelId,
          variant_id: variantId,
          version_id: versionId,
        },
      });

      const validActions = await sequelize.query(validateActionIds, {
        replacements: {
          actions: groupedPrivileges[privilegeIndex].actions,
          model_id: modelId,
          variant_id: variantId,
          version_id: versionId,
        },
        raw: true,
      });
      if (!validActions[0][0]?.result) {
        errorResponse = {
          success: false,
          message: errorResponses.INVALID_ACTION_ID,
          errorCode: statusCodes.STATUS_CODE_INVALID_FORMAT,
        };
        error = true;
        break;
      }

      const { success, data, message, errorCode } = await this.getActionDetails(
        {
          listOfActions: groupedPrivileges[privilegeIndex].actions,
          modelId,
          variantId,
          versionId,
        },
      );

      if (!success) {
        errorResponse = {
          success: false,
          message,
          errorCode,
        };
        error = true;
        break;
      }
      if (personalityExists) {
        personalityExists.privileges = data;
        personalityExists.save();
      } else {
        personality.privileges = data;
        personalities.push(personality);
      }
      effectedPersonalities.push(groupedPrivileges[privilegeIndex].personality);
    }
    if (error) {
      return new HelperResponse(errorResponse);
    }

    if (!personalityExists) {
      await aergov_device_model_privileges.bulkCreate(personalities);
    }

    let versionData = await aergov_device_versions.findOne({
      where: {
        id: versionId,
      },
    });

    versionData.status = status.ACTIVE;
    await versionData.save();

    await transaction.commit();
    return new HelperResponse({
      success: true,
      message: successResponses.PRIVILEGES_ADDED,
      data: {
        model_id: modelId,
        variant_id: variantId,
        version_id: versionId,
        effectedPersonalities,
      },
    });
  } catch (err) {
    await transaction.rollback();
    logger.error(err);
    return new HelperResponse({ success: false, message: err.message });
  }
};

exports.groupPrivileges = (privileges) => {
  try {
    const groupedPrivileges = privileges.reduce((acc, privilege) => {
      const personality = privilege.personality;
      const actions = privilege.actions;

      const existingPrivilege = acc.find((p) => p.personality === personality);

      if (existingPrivilege) {
        existingPrivilege.actions = Array.from(
          new Set([...existingPrivilege.actions, ...actions]),
        );
      } else {
        acc.push({ personality, actions });
      }

      return acc;
    }, []);

    const result = Object.values(groupedPrivileges);

    return new HelperResponse({ success: true, data: result });
  } catch (err) {
    return new HelperResponse({ success: false, message: err.message });
  }
};

exports.validateModelVariantVersionId = async ({
  modelId,
  variantId,
  versionId,
}) => {
  try {
    const versionInfo = await aergov_device_versions.findOne({
      where: { id: versionId },
      raw: true,
      attributes: {
        exclude: ['created_at', 'createdAt', 'updated_at', 'updatedAt'],
      },
    });

    if (!versionInfo) {
      return new HelperResponse({
        success: false,
        message: errorResponses.INVALID_ID('VERSION', versionId),
        errorCode: statusCodes.STATUS_CODE_INVALID_FORMAT,
      });
    }

    if (modelId !== versionInfo.model_id) {
      return new HelperResponse({
        success: false,
        message: errorResponses.INVALID_ID('MODEL', modelId),
        errorCode: statusCodes.STATUS_CODE_INVALID_FORMAT,
      });
    }

    if (variantId !== versionInfo.variant_id) {
      return new HelperResponse({
        success: false,
        message: errorResponses.INVALID_ID('VARIANT', variantId),
        errorCode: statusCodes.STATUS_CODE_INVALID_FORMAT,
      });
    }

    return new HelperResponse({ success: true, data: versionInfo });
  } catch (err) {
    logger.error(err.message);
    return new HelperResponse({ success: false, message: err.message });
  }
};

exports.getActionDetails = async ({
  listOfActions,
  modelId,
  versionId,
  variantId,
}) => {
  try {
    const data = await sequelize.query(getActions, {
      replacements: {
        actions: listOfActions,
        model_id: modelId,
        variant_id: variantId,
        version_id: versionId,
      },
      raw: true,
    });

    return new HelperResponse({
      success: true,
      data: data[0][0]?.all_action_data,
    });
  } catch (err) {
    return new HelperResponse({ success: false, message: err.message });
  }
};

exports.getModelVariantVersionDetails = async ({ id }) => {
  try {
    let modelId;
    let variantId;
    let versionId;

    const modelVariantVersionData = await sequelize.query(
      modelVariantVersionDataQuery,
      {
        replacements: {
          id,
        },
      },
    );
    if (!modelVariantVersionData[0][0]) {
      return {
        success: false,
        errorCode: statusCodes.STATUS_CODE_DATA_NOT_FOUND,
        message: errorResponses.LEVEL_ID_NOT_FOUND,
        data: null,
      };
    }
    modelId = modelVariantVersionData[0][0].model_id;
    variantId = modelVariantVersionData[0][0].variant_id;
    versionId = modelVariantVersionData[0][0].version_id;

    return {
      success: true,
      data: {
        modelId,
        variantId,
        versionId,
      },
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

exports.listDeviceLevelPrivileges = async ({ id }) => {
  try {
    const { success, errorCode, message, data } =
      await this.getModelVariantVersionDetails({ id });
    if (!success) {
      return {
        success: false,
        errorCode,
        message,
        data,
      };
    }
    const { modelId, variantId, versionId } = data;

    const privilegesData = await sequelize.query(getDevicePrivileges, {
      replacements: {
        model_id: modelId ? modelId : null,
        variant_id: variantId ? variantId : null,
        version_id: versionId ? versionId : null,
      },
      type: sequelize.QueryTypes.SELECT,
    });
    if (!privilegesData[0]) {
      return {
        success: false,
        errorCode: statusCodes.STATUS_CODE_DATA_NOT_FOUND,
        message: errorResponses.LEVEL_ID_NOT_FOUND,
        data: null,
      };
    }
    return {
      success: true,
      data: {
        privileges: privilegesData[0].result,
      },
      message: successResponses.DATA_FETCH_SUCCESSFUL,
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

const getPrivilegesData = async ({ queryCondition, type }) => {
  const privilegesData = await sequelize.query(
    getPrivileges.replace(`{{queryCondition}}`, queryCondition),
    {
      replacements: { type },
      type: sequelize.QueryTypes.SELECT,
    },
  );
  return privilegesData;
};

exports.listMasterPrivileges = async ({ type, id }) => {
  try {
    type = type.trim();
    let modelVariantVersionData = {
      modelId: null,
      variantId: null,
    };
    if (id) {
      const { success, errorCode, message, data } =
        await this.getModelVariantVersionDetails({ id });
      if (!success) {
        return {
          success: false,
          errorCode,
          message,
          data: null,
        };
      }
      modelVariantVersionData = data;
    }
    const { modelId, variantId } = modelVariantVersionData;

    let filterCondition;
    if (type && modelId && variantId) {
      filterCondition = filterConditionQuery(modelId, variantId);
    } else if (type && modelId) {
      filterCondition = filterConditionQuery(modelId, variantId);
    } else if (type) {
      filterCondition = '';
    }

    const privilegesData = await getPrivilegesData({
      queryCondition: filterCondition,
      type,
    });
    return {
      success: true,
      message: successResponses.DATA_FETCH_SUCCESSFUL,
      data: privilegesData,
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
