const {
  createDeviceLevel,
} = require('../controllers/device/device.controller');
const {
  validateDeviceInput,
} = require('../controllers/device/device.middleware');

module.exports = function (app) {
  app.post('/devices/device-level', validateDeviceInput, createDeviceLevel);
};
