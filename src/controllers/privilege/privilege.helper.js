const {
  sequelize,
} = require('../../services/aerpace-ecosystem-backend-db/src/databases/postgresql/models');
const { logger } = require('../../utils/logger');
const { statusCodes } = require('../../utils/statusCode');
const { errorResponses, successResponses } = require('./privilege.constant');
const { getDevicePrivileges } = require('./privilege.query');

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
