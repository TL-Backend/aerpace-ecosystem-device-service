const { getAllDevicesFromType } = require('./device.query');
const {
  sequelize,
} = require('../../services/aerpace-ecosystem-backend-db/src/databases/postgresql/models');
const { logger } = require('../../utils/logger');
const { statusCodes } = require('../../utils/statusCode');
const { successResponses } = require('./device.constant');
const { queries } = require('./device.query');

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
