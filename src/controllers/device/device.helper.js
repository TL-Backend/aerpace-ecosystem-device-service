const { getAllDevicesFromType } = require('./device.query');
const {
  sequelize,
  aergov_device_versions,
} = require('../../services/aerpace-ecosystem-backend-db/src/databases/postgresql/models');
const { logger } = require('../../utils/logger');
const { statusCodes } = require('../../utils/statusCode');
const { successResponses, errorResponses } = require('./device.constant');
const { queries } = require('./device.query');
const {
  constants,
} = require('../../services/aerpace-ecosystem-backend-db/src/commons/constant');

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

exports.deleteVersionHelper = async (versionId) => {
  try {
    const versionData = await aergov_device_versions.findOne({
      where: {
        id: versionId,
      },
    });
    if (!versionData || versionData.status === 'INACTIVE') {
      return {
        success: false,
        errorCode: statusCodes.STATUS_CODE_INVALID_FORMAT,
        message: errorResponses.VERSION_NOT_FOUND,
        data: null,
      };
    }
    versionData.status = 'INACTIVE';
    versionData.save();
    return {
      success: true,
      errorCode: statusCodes.STATUS_CODE_SUCCESS,
      message: successResponses.VERSION_DELETED_SUCCESSFULLY,
      data: null,
    };
  } catch (err) {
    logger.error(err.message);
    return {
      success: false,
      message: err.message,
      errorCode: statusCodes.STATUS_CODE_FAILURE,
      data: null,
    };
  }
};
