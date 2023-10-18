const {
  getDeviceLevelPrivileges,
  listMasterPrivileges,
} = require('../controllers/privilege/privilege.controller');
const {
  listDevicePrivilegesValidation,
  listMasterPrivilegesValidation,
} = require('../controllers/privilege/privilege.middleware');

module.exports = function (app) {
  app.get(
    '/privileges/devices',
    listDevicePrivilegesValidation,
    getDeviceLevelPrivileges,
  );
};

module.exports = function (app) {
  app.get('/privileges', listMasterPrivilegesValidation, listMasterPrivileges);
};
