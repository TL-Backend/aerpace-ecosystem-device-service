const {
  sequelize,
} = require('../../services/aerpace-ecosystem-backend-db/src/databases/postgresql/models');
const { dbTables } = require('../../utils/constant');
const { logger } = require('../../utils/logger');
const { statusCodes } = require('../../utils/statusCode');
const { successResponses, errorResponses } = require('./privilege.constant');
const { getPrivileges, getDeviceVariants } = require('./privilege.query');

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

    let queryCondition, checkCondition;
    if (type && modelId && variantId) {
      checkCondition = ` INNER JOIN ${dbTables.DEVICE_MODELS_TABLE} AS adm ON adve.model_id = adm.id INNER JOIN ${dbTables.DEVICE_VARIANT_TABLE} AS adva ON adve.variant_id = adva.id WHERE adve.model_id = :model_id AND adve.variant_id = :variant_id`;
      queryCondition = `AND adma.id NOT IN (SELECT action_id FROM aergov_device_actions WHERE (model_id = '${modelId}' AND variant_id is NULL) OR (model_id = '${modelId}' AND variant_id = '${variantId}' AND version_id is NUll))`;
    } else if (type && modelId) {
      checkCondition = ` INNER JOIN ${dbTables.DEVICE_MODELS_TABLE} AS adm ON adve.model_id = adm.id WHERE adve.model_id = :model_id `;
      queryCondition = `AND adma.id NOT IN (SELECT action_id FROM aergov_device_actions WHERE (model_id = '${modelId}' AND variant_id is NUll) OR (model_id = '${modelId}' AND variant_id = '${variantId}' AND version_id is NULL))`;
    } else if (type) {
      checkCondition = '';
      queryCondition = '';
    }

    const conditionStatus = await validateCondition({
      checkCondition,
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

    const previlegesData = await getPrivilegesData({ queryCondition, type });
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
