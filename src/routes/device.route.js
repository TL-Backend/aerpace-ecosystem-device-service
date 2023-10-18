const {
  getDevicesList,
  listDevicesTypes,
  createDeviceLevel,
} = require('../controllers/device/device.controller');

const {
  validateGetDevicesTypeInput,
  validateDeviceInput,
} = require('../controllers/device/device.middleware');

module.exports = function (app) {
  app.get('/devices/types', listDevicesTypes);
  app.get('/devices/:device_type', validateGetDevicesTypeInput, getDevicesList);
  app.post('/devices/device-level', validateDeviceInput, createDeviceLevel);
};
