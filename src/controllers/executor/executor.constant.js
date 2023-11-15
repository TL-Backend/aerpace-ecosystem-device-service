exports.successResponses = {
  DEVICE_COMMUNICATED_SUCCESSFULLY: `Device communicated successfully`,
};

exports.errorResponses = {
  SOMETHING_WENT_WRONG: `Something went wrong`,
  ACTION_TYPE_NOT_FOUND: `Action type not found`,
  NO_ACCESS: `Unauthorized to perform the operation`,
  INVALID_PARAMETER: `Parameter not valid for given action`,
  PARAMETERS_REQUIRED: `Parameters required for given action`,
  DEVICE_NOT_FOUND: `Device not found`,
  DEVICE_REQUIRED: `Device_id is missing or device_id invalid`,
  ACTION_REQUIRED: `Action is missing or action invalid`,
};

exports.actionParameters = {
  'AC#TURN_ON': { temperature: 'number', mode: 'string' },
};
