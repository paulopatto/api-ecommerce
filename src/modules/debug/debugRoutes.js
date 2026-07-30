const express = require('express');
const debugController = require('./debugController');

const router = express.Router();

router.get('/error-500', debugController.error500);
router.get('/error-404', debugController.error404);
router.get('/slow', debugController.slow);

module.exports = router;
