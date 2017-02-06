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


});

router.post('/post', function (req, res, next) {

    var job = {
        media_type: req.body.media_type,
        name: req.body.name,
        codec: req.body.codec,
        bitrate: req.body.bitrate,
        optional: req.body.optional,
        output: req.body.output
    };

    DB_Jobs.push('/job[]', job);
    res.sendStatus(200);
});

router.delete('/delete/:id', function (req, res, next) {


});
module.exports = router;