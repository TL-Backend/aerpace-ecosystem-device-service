const {
  getDevicesList,
  listDevicesTypes,
} = require('../controllers/device/device.controller');

const {
  validateGetDevicesTypeInput,
} = require('../controllers/device/device.middleware');

module.exports = function (app) {
  app.get('/devices/types', listDevicesTypes);
  app.get('/devices/:device_type', validateGetDevicesTypeInput, getDevicesList);
};
