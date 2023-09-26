const {
  sequelize,
} = require('../../services/aerpace-ecosystem-backend-db/src/databases/postgresql/models');
const { dbTables } = require('../../utils/constant');
const { logger } = require('../../utils/logger');
const { statusCodes } = require('../../utils/statusCode');
const { successResponses, errorResponses } = require('./privilege.constant');
const {
  getPrivileges,
  getDeviceVariants,
  conditions,
  filterConditionQuery,
} = require('./privilege.query');

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
