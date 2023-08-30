const {
  listDevicesTypes,
} = require('../controllers/device/devices.controller');

module.exports = function (app) {
  app.get('/devices/types', listDevicesTypes);
};
