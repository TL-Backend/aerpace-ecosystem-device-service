const {
  listMasterPrivileges,
} = require('../controllers/privilege/privilege.controller');
const {
  listMasterPrivilegesValidation,
} = require('../controllers/privilege/privilege.middleware');

module.exports = function (app) {
  app.get('/privileges', listMasterPrivilegesValidation, listMasterPrivileges);
};
