var express = require('express');
var router = express.Router();
var config = require('./../config.json');
var logger = require('./../functions/logger');


/**
 * RESTful API
 * fordert einen Status an. Der Mediaserver gibt den Code 200 zurück und ob gerade ein Kodierungsprozess läuft.
 * Für die URI ist keine Authentifikation per Token erforderlich.
 * @url  /public/status
 * @method GET
 */
router.get('/status', function (req, res, next) {

    res.json({success: true, isTranscoding: isRunningTranscoding});
});


module.exports = router;