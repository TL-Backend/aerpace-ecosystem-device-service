const router = require('express').Router();

require('./sample.route')(router);
require('./device.route')(router);

module.exports = {
  router,
};
