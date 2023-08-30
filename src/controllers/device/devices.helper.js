const {
  aergov_device_models,
  sequelize,
} = require('../../services/aerpace-ecosystem-backend-db/src/databases/postgresql/models');
const { queries } = require('./devices.query');

exports.getDeviceTypes = async () => {
  try {
    const counts = await sequelize.query(queries.getDeviceCount);
    return {
      success: true,
      data: counts[0],
    };
  } catch (err) {
    logger.error(err);
    return {
      success: false,
      code: statusCodes.STATUS_CODE_FAILURE,
      message: '',
    };
  }
};
