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


    var i = 0;
    while (req.body[i] != undefined) {
        var job = {
            media_type: req.body[i].media_type,
            name: req.body[i].name,
            codec: req.body[i].codec,
            bitrate: req.body[i].bitrate,
            optional: req.body[i].optional,
            output: req.body[i].output,
            progress: 0
        };
        DB_Jobs.push('/job[]', job, true);
        i++;
    }
    //DB_Jobs.save();
    //DB_Jobs.reload();

    res.sendStatus(200);
});

router.delete('/delete', function (req, res, next) {
    DB_Jobs.delete("/");
    res.sendStatus(200);
});
module.exports = router;