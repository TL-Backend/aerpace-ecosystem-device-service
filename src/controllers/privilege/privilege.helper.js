const {
  sequelize,
} = require('../../services/aerpace-ecosystem-backend-db/src/databases/postgresql/models');
const { logger } = require('../../utils/logger');
const { statusCodes } = require('../../utils/statusCode');
const { successResponses } = require('./privilege.constant');
const { getPrivileges } = require('./privilege.query');

exports.listMasterPrivileges = async ({ type, modelId, variantId }) => {
  try {
    type = type.trim();
    modelId = modelId ? modelId.trim() : null;
    variantId = variantId ? variantId.trim() : null;

    let queryCondition;
    if (type && modelId && variantId) {
      queryCondition = `AND adma.id NOT IN (SELECT action_id FROM aergov_device_actions WHERE model_id = '${modelId}' AND variant_id = '${variantId}')`;
    } else if (type && modelId) {
      queryCondition = `AND adma.id NOT IN (SELECT action_id FROM aergov_device_actions WHERE model_id = '${modelId}' AND variant_id is NUll)`;
    } else if (type) {
      queryCondition = '';
    }

    const previlegesData = await sequelize.query(
      getPrivileges.replace(`{{queryCondition}}`, queryCondition),
      {
        replacements: { type },
        type: sequelize.QueryTypes.SELECT,
      },
    );
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
