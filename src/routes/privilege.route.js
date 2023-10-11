const {
  addPersonalityPrivileges,
  getDeviceLevelPrivileges,
} = require('../controllers/privilege/privilege.controller');
const {
  validateAddPersonalityPrivileges,
  listDevicePrivilegesValidation,
} = require('../controllers/privilege/privilege.middleware');

module.exports = function (app) {
  app.post(
    '/privileges/personality',
    validateAddPersonalityPrivileges,
    addPersonalityPrivileges,
  );
  app.get(
    '/privileges/devices',
    listDevicePrivilegesValidation,
    getDeviceLevelPrivileges,
  );
};
