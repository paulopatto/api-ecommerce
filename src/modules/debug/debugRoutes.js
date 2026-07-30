const express = require('express');
const debugController = require('./debugController');

const router = express.Router();

router.get('/error-500', debugController.error500);

module.exports = router;
