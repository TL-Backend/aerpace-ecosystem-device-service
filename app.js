'use strict';

require('dotenv').config();
const express = require('express');
const app = express();

const { errorResponse } = require('./src/utils/responseHandler');
const { statusCodes } = require('./src/utils/statusCodes');
const { router } = require('./src/routes/index');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/v1', router);

app.use((req, res, next) =>
  errorResponse({
    code: statusCodes.STATUS_CODE_DATA_NOT_FOUND,
    req,
    res,
    message: 'Route not found',
  }),
);

app.use((error, req, res, next) =>
  errorResponse({
    code: statusCodes.STATUS_CODE_FAILURE,
    req,
    res,
    error,
    message: error.message,
  }),
);

app.listen(process.env.PORT || 3000, () => {
  console.log(`server started running on port ${process.env.PORT || 3000}`);
});
