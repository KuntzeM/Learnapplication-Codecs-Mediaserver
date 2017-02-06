var express = require('express');
var app = express();
var router = express.Router();
var jwt = require('jwt-simple');
fs = require('fs');
path = require('path');
var config = require('./../config.json');
var upload = require('jquery-file-upload-middleware');
var handleMedia = require('../functions/handleMedia');
var imMagick = require('imagemagick');
var ffmpeg = require('fluent-ffmpeg');
var logger = require('./../functions/logger');
var mime = require('mime');
var jwtauth = require('./../functions/jwtauth.js');


router.get('/get', function (req, res, next) {

    res.json(DB_Logs.getData("log").log);
});

router.get('/delete', function (req, res, next) {
    DB_Logs.delete("/")
    res.sendStatus(200)
});

module.exports = router;