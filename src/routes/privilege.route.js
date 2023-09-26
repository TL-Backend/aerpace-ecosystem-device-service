const {
  getDeviceLevelPrivileges,
} = require('../controllers/privilege/privilege.controller');
const {
  listDevicePrivilegesValidation,
} = require('../controllers/privilege/privilege.middleware');

module.exports = function (app) {
  app.get(
    '/privileges/devices',
    listDevicePrivilegesValidation,
    getDeviceLevelPrivileges,
  );
};
