const {
  fetchUserQuery,
  checkPrivileges,
} = require('../executor/executor.query');
const { statusCodes } = require('../../utils/statusCode');
const { logger } = require('../../utils/logger');
const {
  errorResponses,
  actionParameters,
  successResponses,
} = require('../executor/executor.constant');
const {
  sequelize,
  aergov_devices,
} = require('../../services/aerpace-ecosystem-backend-db/src/databases/postgresql/models');

module.exports = {
  authorizer: async ({ userId, deviceId, action }) => {
    try {
      const userData = await sequelize.query(fetchUserQuery, {
        replacements: {
          user_id: userId,
        },
      });

      if (!userData[0][0]) {
        return {
          success: false,
          errorCode: statusCodes.STATUS_CODE_UNAUTHORIZED,
          message: errorResponses.NO_ACCESS,
          data: {},
        };
      }
      const deviceData = await aergov_devices.findOne({
        where: {
          id: deviceId,
        },
      });

      if (!deviceData) {
        return {
          success: false,
          errorCode: statusCodes.STATUS_CODE_DATA_NOT_FOUND,
          message: errorResponses.DEVICE_NOT_FOUND,
          data: {},
        };
      }

      const validUser = await sequelize.query(checkPrivileges, {
        replacements: {
          device_id: deviceId,
          action_identifier: action,
          user_type: userData[0][0].user_type,
        },
      });
      if (!validUser[0][0]) {
        return {
          success: false,
          errorCode: statusCodes.STATUS_CODE_UNAUTHORIZED,
          message: errorResponses.NO_ACCESS,
          data: {},
        };
      }

      return {
        success: true,
        data: {
          userData,
        },
      };
    } catch (err) {
      logger.error(err);
      return {
        success: false,
        errorCode: statusCodes.STATUS_CODE_FAILURE,
        message: errorResponses.SOMETHING_WENT_WRONG,
        data: {},
      };
    }
  },

  inputValidator: (action, parameter) => {
    try {
      const parameterNames = Object.keys(parameter);
      const actionParameterNames = Object.keys(actionParameters[action]);
      if (!parameterNames.length) {
        return {
          success: false,
          message: errorResponses.PARAMETERS_REQUIRED,
          errorCode: statusCodes.STATUS_CODE_INVALID_FORMAT,
          data: {},
        };
      }

      for (let index = 0; index < parameterNames.length; index++) {
        const element = parameterNames[index];
        if (
          !actionParameters[action] ||
          !actionParameterNames.includes(element) ||
          typeof parameter[element] !== actionParameters[action][element]
        ) {
          return {
            success: false,
            message: errorResponses.INVALID_PARAMETER,
            errorCode: statusCodes.STATUS_CODE_INVALID_FORMAT,
            data: {},
          };
        }
      }
      return {
        success: true,
        data: {},
      };
    } catch (err) {
      logger.error(err);
      return {
        success: false,
        errorCode: statusCodes.STATUS_CODE_FAILURE,
        message: errorResponses.SOMETHING_WENT_WRONG,
      };
    }
  },

  executor: (parameter, userData, deviceId) => {
    // IOT IMPLEMENTATION
    return {
      success: true,
      message: successResponses.DEVICE_COMMUNICATED_SUCCESSFULLY,
    };
  },
  response: {
    NO_AC_DETECTED: "Couldn't find the AC ",
  },
};
