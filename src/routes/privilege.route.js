const {
  addPersonalityPrivileges,
  getDeviceLevelPrivileges,
  listMasterPrivileges,
} = require('../controllers/privilege/privilege.controller');
const {
  validateAddPersonalityPrivileges,
  listDevicePrivilegesValidation,
  listMasterPrivilegesValidation,
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

module.exports = function (app) {
  app.get('/privileges', listMasterPrivilegesValidation, listMasterPrivileges);
};
