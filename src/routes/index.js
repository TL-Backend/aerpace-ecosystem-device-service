const router = require('express').Router();

require('./sample.route')(router);
require('./devices.routes')(router);

module.exports = {
  router,
};
