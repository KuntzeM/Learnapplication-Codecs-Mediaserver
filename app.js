var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var jwt    = require('jwt-simple');
var auth = require('./routes/auth');
var public = require('./routes/public');
var moment = require('moment');
var jwtauth = require('./functions/jwtauth.js');
var dbconnection = require('./functions/connectMysql.js')
var app = express();
var config = require('./config.json');


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.all('/auth/*', jwtauth);


app.use('/public', public);
app.use('/auth', auth);

app.set('jwtTokenSecret', config.api.key);
app.set('connection', dbconnection());















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
