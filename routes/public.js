var express = require('express');
var router = express.Router();
var config = require('./../config.json');
var logger = require('./../functions/logger');

router.get('/status', function (req, res, next) {

    res.json({success: true, isTranscoding: isRunningTranscoding});
});


module.exports = router;