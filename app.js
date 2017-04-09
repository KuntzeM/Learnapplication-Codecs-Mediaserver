var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var jwt    = require('jwt-simple');
var events = require('events');
var JsonDB = require('node-json-db');
var moment = require('moment');

/**
 * Routen der RESTful API einbinden
  */
var media = require('./routes/media');
var jobs = require('./routes/jobs');
var log = require('./routes/log');
var public = require('./routes/public');


/**
 * eigene Funktionen und Konfigurationsdatei einbinden
  */
var jwtauth = require('./functions/jwtauth.js');
var transcoding = require('./functions/transcoding');
var config = require('./config.json');
var logger = require('./functions/logger');
logger.debugLevel = 'info';

console.log('packages loaded ...');

var app = express();

/**
 * JSON-Datenbank für die Kodierungsprozesse anlegen, falls nicht existiert
 * @type {JsonDB}
 */
global.DB_Jobs = new JsonDB("storage/jobs", true, true);
/**
 * JSON-Datenbank für die Log-Einträge anlegen, falls nicht existiert
 * @type {JsonDB}
 */
global.DB_Logs = new JsonDB("storage/logs", true, true);
/**
 * globale Variable zum überprüfen ob ein Kodierungsprozess läuft
 * @type {boolean}
 */
global.isRunningTranscoding = false;
/**
 * globale Variable zum überprüfen ob PSNR oder SSIM mit FFmpeg gerade berechnet wird
 * @type {boolean}
 */
global.computeMetric = false;

/**
 * API Schlüssel String aus der Konfigurationsdatei dem Server bekannt machen
 */
app.set('jwtTokenSecret', config.api.key);


/**
 * HTTP Anfrage wird für Weiterverarbeitung geparst
  */
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Alle Public-Routen werden an public weitergeleitet
 * -> keine Authentifikation
 */
app.use('/public', public);

/**
 * alle restlichen Anfragen werden auf ihren Token überprüft
 */
app.all('/*', jwtauth);

/**
 * nach erfolgreicher Authentifikation werden sie an ihre Routen weitergeleitet
 */
app.use('/media', media);
app.use('/jobs', jobs);
app.use('/log', log);

console.log('routes are started.');

/**
 * dem System die Kodierungsevents bekannt machen
 */
var transcodeEvent = new events.EventEmitter();
app.set('transcodeEvent', transcodeEvent);
transcodeEvent.on('startVideoTranscoding', transcoding.startVideoTranscoding);
transcodeEvent.on('startImageTranscoding', transcoding.startImageTranscoding);
transcodeEvent.on('prepareTranscoding', transcoding.prepareTranscoding);

/**
 *   Error Handler
 */
app.use(function (err, req, res, next) {
    res.sendStatus(err.statusCode || 500);

    if (err.status == 'warn') {
        logger.log('warn', err.message || err);
    } else {
        logger.log('error', err.message || err);
    }

});

module.exports = app;
