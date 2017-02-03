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
var logger = require('./../functions/logger');

/* GET media files. */
router.get('/media/:id', handleMedia.searchMedia, function (req, res, next) {
    logger.log('warn', 'Everything started properly.');
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
                if (err) {
                    res.json({success: false, message: err.message});
                } else {
                    res.writeHead(200);
                    res.end(stdout, 'binary');
                }

            });

        }else{
            var img = fs.readFileSync(req.media_path);
            res.writeHead(200);
            res.end(img, 'binary');
        }

    } catch (err) {
        res.json({success: false, message: err.message});
    }
});

/* GET media configuration files. */
router.get('/media_codec/:media_config', handleMedia.searchMediaConfig, function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    var size = null;
    if (req.query.size) {
        size = parseInt(req.query.size)
    }

    try {

        if (req.media_type == "image") {
            if (req.convert) {
                req.file_path = req.file_path + '.png';
            }
            if (size != null) {
                imMagick.resize({
                    srcData: fs.readFileSync(req.file_path, 'binary'),
                    width: size
                }, function (err, stdout, stderr) {
                    if (err) {
                        res.json({success: false, message: err.message});
                    } else {
                        res.writeHead(200, {'Content-Type': 'image'});
                        res.end(stdout, 'binary');
                    }
                });
            } else {
                res.writeHead(200, {'Content-Type': 'image'});
                res.end(fs.readFileSync(req.file_path), 'binary');
            }


        } else {
            if (req.convert) {
                req.file_path = req.file_path + '.mp4';
            }
            var path = req.file_path;
            var stat = fs.statSync(path);
            var total = stat.size;
            if (req.headers['range']) {
                var range = req.headers.range;
                var parts = range.replace(/bytes=/, "").split("-");
                var partialstart = parts[0];
                var partialend = parts[1];

                var start = parseInt(partialstart, 10);
                var end = partialend ? parseInt(partialend, 10) : total - 1;
                var chunksize = (end - start) + 1;
                console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);

                var file = fs.createReadStream(path, {start: start, end: end});
                res.writeHead(206, {
                    'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': 'video'
                });
                file.pipe(res);
            } else {
                console.log('ALL: ' + total);
                res.writeHead(200, {'Content-Length': total, 'Content-Type': 'video'});
                fs.createReadStream(path).pipe(res);
            }
            /*
            var img = fs.readFileSync(req.file_path);
            res.writeHead(200);
            res.end(img, 'binary');
             */


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
