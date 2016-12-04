var express = require('express');
var app = express();
var router = express.Router();
var jwt    = require('jwt-simple');
fs = require('fs');
path = require('path');
var config = require('./../config.json');
var upload = require('jquery-file-upload-middleware');
var handleMedia = require('../functions/handleMedia');
var imMagick = require('imagemagick');
var ffmpeg = require('fluent-ffmpeg');

/* GET media files. */
router.get('/media/:id', handleMedia.searchMedia, function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    var size = null;
    if(req.query.size){
        size = parseInt(req.query.size)
    }

    try {
        if (req.media_type == "image" && size != null) {
            imMagick.resize({
                srcData: fs.readFileSync(req.media_path, 'binary'),
                width:   size
            }, function(err, stdout, stderr){
                if (err) throw err;
                res.writeHead(200);
                res.end(stdout, 'binary');
            });

        }else{
            var img = fs.readFileSync(req.media_path);
            res.writeHead(200);
            res.end(img, 'binary');
        }

    } catch (err) {
        res.json({success: false, message: err.code});
    }
});

/* GET media configuration files. */
router.get('/media_codec/:media/:config', handleMedia.searchMediaConfig, function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    var size = null;
    if (req.query.size) {
        size = parseInt(req.query.size)
    }

    try {
        if (req.media_type == "image" && size != null) {
            imMagick.resize({
                srcData: fs.readFileSync(req.file_path, 'binary'),
                width: size
            }, function (err, stdout, stderr) {
                if (err) throw err;
                res.writeHead(200);
                res.end(stdout, 'binary');
            });

        } else {
            var img = fs.readFileSync(req.file_path);
            res.writeHead(200);
            res.end(img, 'binary');
        }

    } catch (err) {
        res.json({success: false, message: err.code});
    }
});


router.get('/status', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.json({success: true});
});

router.get('/test', function (req, res, next) {


});
module.exports = router;
