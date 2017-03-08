var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var jwt    = require('jwt-simple');
var events = require('events');
var JsonDB = require('node-json-db');
var moment = require('moment');

// include routes
var media = require('./routes/media');
var jobs = require('./routes/jobs');
var log = require('./routes/log');
var public = require('./routes/public');



// include own functions
var jwtauth = require('./functions/jwtauth.js');
var transcoding = require('./functions/transcoding');
var config = require('./config.json');
var logger = require('./functions/logger');
logger.debugLevel = 'info';

console.log('packages loaded ...');

var app = express();

// set global vars
global.DB_Jobs = new JsonDB("storage/jobs", true, true);
global.DB_Logs = new JsonDB("storage/logs", true, true);
global.isRunningTranscoding = false;
global.computeMetric = false;

app.set('jwtTokenSecret', config.api.key);


// parse http arguments to object
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// first initialize public -> no authentification
// then initilize app.all(/*, jwtauth)
app.use('/public', public);

// all requests have to authenticate. jwtauth checks the token.
app.all('/*', jwtauth);

// set all routes
app.use('/media', media);
app.use('/jobs', jobs);
app.use('/log', log);


console.log('routes are started.');

// set transcoding events
var transcodeEvent = new events.EventEmitter();
app.set('transcodeEvent', transcodeEvent);
transcodeEvent.on('startVideoTranscoding', transcoding.startVideoTranscoding);
transcodeEvent.on('startImageTranscoding', transcoding.startImageTranscoding);
transcodeEvent.on('prepareTranscoding', transcoding.prepareTranscoding);


/**
 *   error handler
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
