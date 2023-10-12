const {
  getAllDevicesFromType,
  getPersonalityPrivileges,
} = require('./device.query');
const {
  sequelize,
  aergov_device_model_privileges,
} = require('../../services/aerpace-ecosystem-backend-db/src/databases/postgresql/models');
const { logger } = require('../../utils/logger');
const { statusCodes } = require('../../utils/statusCode');
const { successResponses, errorResponses } = require('./device.constant');
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

exports.getPersonalityPrivilegesHelper = async ({ params }) => {
  try {
    const personalityData = await sequelize.query(getPersonalityPrivileges, {
      replacements: {
        model_id: params.model_id,
        variant_id: params.variant_id,
        version_id: params.version_id,
      },
    });
    console.log(personalityData[0][0]);
    return {
      success: true,
      errorCode: statusCodes.STATUS_CODE_SUCCESS,
      message: successResponses.DATA_FETCH_SUCCESSFULL,
      data: {
        persoanlities: personalityData[0][0].persoanlities
          ? personalityData[0][0].persoanlities
          : [],
      },
    };
  } catch (err) {
    logger.error(err.message);
    return {
      success: false,
      errorCode: statusCodes.STATUS_CODE_FAILURE,
      message: errorResponses.INTERNAL_ERROR,
      data: null,
    };
  }
};
