var express = require('express');
var app = express();
var router = express.Router();
var jwt = require('jwt-simple');
fs = require('fs');
path = require('path');
var config = require('./../config.json');
var upload = require('jquery-file-upload-middleware');
var imMagick = require('imagemagick');
var ffmpeg = require('fluent-ffmpeg');
var logger = require('./../functions/logger');
var mime = require('mime');
var jwtauth = require('./../functions/jwtauth.js');


router.get('/get', function (req, res, next) {

    try {
        var log = DB_Logs.getData("log").log;
        if (log == undefined) {
            throw new Exception('kein Log vorhanden!');
        }
        res.json(log);
    } catch (e) {
        res.sendStatus(404)
    }

});

router.get('/delete', function (req, res, next) {
    DB_Logs.delete("/");
    res.sendStatus(200)
});

router.get('/status', function (req, res, next) {
    res.json({success: true});
});

module.exports = router;