const router = require('express').Router();

require('./sample.route')(router);
require('./devices.route')(router);

module.exports = {
  router,
};
