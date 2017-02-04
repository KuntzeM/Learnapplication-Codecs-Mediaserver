var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
//var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var jwt    = require('jwt-simple');
var events = require('events');


// include routes
var auth = require('./routes/auth');
var public = require('./routes/public');
var moment = require('moment');

// include own functions
var jwtauth = require('./functions/jwtauth.js');
var transcoding = require('./functions/transcoding');
var dbconnection = require('./functions/connectMysql.js')
var config = require('./config.json');
var logger = require('./functions/logger');
logger.debugLevel = 'info';
// formdata parser
var multer = require('multer');
var upload = multer();


var app = express();

global.isRunningTranscoding = false;

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'origin, X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    //res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

console.log('packages loaded ...');


app.all('/auth/*', upload.any());
app.all('/auth/*', jwtauth);


app.use('/public', public);
app.use('/auth', auth);

console.log('routes are started.');

app.set('jwtTokenSecret', config.api.key);
global.connection = dbconnection();
//app.set('connection', dbconnection());


var transcodeEvent = new events.EventEmitter();
app.set('transcodeEvent', transcodeEvent);
transcodeEvent.on('startVideoTranscoding', transcoding.startVideoTranscoding);
transcodeEvent.on('startImageTranscoding', transcoding.startImageTranscoding);
transcodeEvent.on('prepareTranscoding', transcoding.prepareTranscoding);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});



// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log(err.message)
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log(err.message)
});


module.exports = app;
