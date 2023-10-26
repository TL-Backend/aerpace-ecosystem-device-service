const {
  getDevicesList,
  listDevicesTypes,
  editDevices,
  getPersonalityDetails,
} = require('../controllers/device/device.controller');

const {
  validateGetDevicesTypeInput,
  validateGetPersonalityPrivilegesInput,
  validateDeviceInput,
} = require('../controllers/device/device.middleware');

module.exports = function (app) {
  app.get('/devices/types', listDevicesTypes);
  app.get(
    '/devices/personality',
    validateGetPersonalityPrivilegesInput,
    getPersonalityDetails,
  );
  app.get('/devices/:device_type', validateGetDevicesTypeInput, getDevicesList);
  app.patch('/devices', validateDeviceInput, editDevices);
};
