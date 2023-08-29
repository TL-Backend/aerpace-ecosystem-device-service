const { sampleTest } = require('../controllers/sample/sample.controller');

module.exports = function (app) {
  app.get('/sample', sampleTest);
};
