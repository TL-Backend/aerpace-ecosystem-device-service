const { createDevices } = require('../controllers/devices/devices.controller');
const {
  validateDeviceInput,
} = require('../controllers/devices/devices.middleware');

module.exports = function (app) {
  app.post('/devices/device-level', validateDeviceInput, createDevices);
};
