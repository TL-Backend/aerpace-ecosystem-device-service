const {
  getDevicesList,
  listDevicesTypes,
  editDevices,
  getPersonalityDetails,
  createDeviceLevel,
  getValidHierarchy,
} = require('../controllers/device/device.controller');

const {
  validateGetDevicesTypeInput,
  validateGetPersonalityPrivilegesInput,
  validateDeviceInput,
  validateEditDeviceInput,
} = require('../controllers/device/device.middleware');

module.exports = function (app) {
  app.get('/devices/types', listDevicesTypes);
  app.get(
    '/devices/personality',
    validateGetPersonalityPrivilegesInput,
    getPersonalityDetails,
  );
  app.get('/devices/:device_type', validateGetDevicesTypeInput, getDevicesList);
  app.post('/devices/device-level', validateDeviceInput, createDeviceLevel);
  app.patch('/devices', validateEditDeviceInput, editDevices);
  app.get('/devices/device-level/:id', getValidHierarchy);
};
