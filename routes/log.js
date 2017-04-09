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


/**
 * RESTful API
 * fordert alle Logs an
 * @url  /log/get
 * @method DELETE
 */
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

/**
 * RESTful API
 * löscht den Log
 * @url  /log/delete
 * @method DELETE
 */
router.get('/delete', function (req, res, next) {
    DB_Logs.delete("/");
    res.sendStatus(200)
});


module.exports = router;