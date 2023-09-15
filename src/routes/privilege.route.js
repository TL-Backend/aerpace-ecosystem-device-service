const {
  addPersonalityPrivileges,
} = require('../controllers/privilege/privilege.controller');
const {
  validateAddPersonalityPrivileges,
} = require('../controllers/privilege/privilege.middleware');

module.exports = function (app) {
  app.post(
    '/privileges/personality',
    validateAddPersonalityPrivileges,
    addPersonalityPrivileges,
  );
};
