const { successResponses, errorResponses } = require('./constant');
const { statusCodes } = require('./statusCode');

class HelperResponse {
  constructor({ success, data, errorCode, message }) {
    if (success) {
      if (!message) {
        message = successResponses.SUCCESS;
      }
      if (!data) {
        data = {};
      }
    }

    if (!success) {
      if (!errorCode) {
        errorCode = statusCodes.STATUS_CODE_FAILURE;
      }
      if (!message) {
        message = errorResponses.FAILURE;
      }
      data = null;
      this.errorCode = errorCode;
    }

    this.success = success;
    this.message = message;
    this.data = data;
  }
}

module.exports = {
  HelperResponse,
};
