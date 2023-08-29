const router = require('express').Router();

require('./sample.route')(router);

module.exports = {
  router,
};
