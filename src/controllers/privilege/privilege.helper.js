const { logger } = require('../../utils/logger');
const { HelperResponse } = require('../../utils/response');
const { statusCodes } = require('../../utils/statusCode');
const { successResponses, errorResponses } = require('./privilege.constant');
const {
  sequelize,
  aergov_device_versions,
  aergov_device_model_privileges,
} = require('../../services/aerpace-ecosystem-backend-db/src/databases/postgresql/models');
const { logger } = require('../../utils/logger');
const { dbTables } = require('../../utils/constant');
const { statusCodes } = require('../../utils/statusCode');
const { errorResponses, successResponses } = require('./privilege.constant');
const {
  getPrivileges,
  getDeviceVariants,
  conditions,
  filterConditionQuery,
  getDevicePrivileges,
} = require('./privilege.query');

exports.addPrivilegesToPersonality = async (params) => {
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

      const personalityExists = await aergov_device_model_privileges.findOne({
        where: { user_type: personality['user_type'] },
        raw: true,
      });

      if (personalityExists) {
        errorResponse = {
          success: false,
          message: errorResponses.PERSONALITY_ALREADY_EXISTS,
          errorCode: statusCodes.STATUS_CODE_INVALID_FORMAT,
        };
        error = true;
        break;
      }

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

      personality.privileges = data;
      personalities.push(personality);
      effectedPersonalities.push(groupedPrivileges[privilegeIndex].personality);
    }

    if (error) {
      return new HelperResponse(errorResponse);
    }

    await aergov_device_model_privileges.bulkCreate(personalities);

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

exports.listDeviceLevelPrivileges = async ({ versionId }) => {
  try {
    const privilegesData = await sequelize.query(getDevicePrivileges, {
      replacements: { version_id: versionId },
      type: sequelize.QueryTypes.SELECT,
    });
    if (!privilegesData[0]) {
      return {
        success: false,
        errorCode: statusCodes.STATUS_CODE_DATA_NOT_FOUND,
        message: errorResponses.INVALID_VERSION,
        data: null,
      };
    }
    return {
      success: true,
      data: {
        privileges: privilegesData[0].data,
      },
      message: successResponses.DATA_FETCH_SUCCESSFULL,
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

const validateCondition = async ({ checkCondition, modelId, variantId }) => {
  const conditionStatus = await sequelize.query(
    getDeviceVariants.replace('{{condition}}', checkCondition),
    {
      replacements: { model_id: modelId, variant_id: variantId },
      type: sequelize.QueryTypes.SELECT,
    },
  );
  return conditionStatus[0].exists;
};

const getPrivilegesData = async ({ queryCondition, type }) => {
  const previlegesData = await sequelize.query(
    getPrivileges.replace(`{{queryCondition}}`, queryCondition),
    {
      replacements: { type },
      type: sequelize.QueryTypes.SELECT,
    },
  );
  return previlegesData;
};

exports.listMasterPrivileges = async ({ type, modelId, variantId }) => {
  try {
    type = type.trim();
    modelId = modelId ? modelId.trim() : null;
    variantId = variantId ? variantId.trim() : null;

    let filterCondition, joinCondition;
    if (type && modelId && variantId) {
      filterCondition = filterConditionQuery(modelId, variantId);
      joinCondition = conditions.versionJoinCondition;
    } else if (type && modelId) {
      joinCondition = conditions.variantJoinCondition;
      filterCondition = filterConditionQuery(modelId, variantId);
    } else if (type) {
      joinCondition = '';
      filterCondition = '';
    }

    const conditionStatus = await validateCondition({
      checkCondition: joinCondition,
      modelId,
      variantId,
    });
    if (!conditionStatus) {
      return {
        success: false,
        errorCode: statusCodes.STATUS_CODE_INVALID_FORMAT,
        message: errorResponses.INVALID_MODEL_VARIANT_COMBINATION,
        data: null,
      };
    }

    const previlegesData = await getPrivilegesData({
      queryCondition: filterCondition,
      type,
    });
    return {
      success: true,
      message: successResponses.DATA_FETCH_SUCCESSFULL,
      data: previlegesData,
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
