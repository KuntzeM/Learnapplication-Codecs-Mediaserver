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
var multer = require('multer');
var upload = multer();


router.get('/get/:media_type/:name', function (req, res, next) {
    file = 'storage/' + req.params.media_type + '/' + req.params.name;

    if (fs.existsSync(file)) {
        var stats = fs.statSync(file);
        var fileSizeInBytes = parseInt(stats["size"]);
        if (fs.existsSync(file + '.png')) {
            file = file + '.png';
        }
        if (fs.existsSync(file + '.mp4')) {
            file = file + '.mp4';
        }
        type = mime.lookup(file);

        if (req.params.media_type == "image" && req.headers.resize != "") {
            imMagick.resize({
                srcData: fs.readFileSync(file, 'binary'),
                width: req.headers.resize
            }, function (error, stdout, stderr) {
                if (error) {
                    var err = new Error(req.params.media_type + '/' + req.params.name + ' resize failed!');
                    err.status = 'warn';
                    err.statusCode = 404;
                    next(err);
                } else {
                    res.writeHead(200, {'Content-Type': type, 'size': fileSizeInBytes});
                    res.end(stdout, 'binary');
                }
            });

        } else {
            res.writeHead(200, {'Content-Type': type, 'size': fileSizeInBytes});
            res.end(fs.readFileSync(file), 'binary');
        }
    } else {
        var err = new Error(req.params.media_type + '/' + req.params.name + ' don\'t exist!');
        err.status = 'warn';
        err.statusCode = 404;
        next(err);
    }

});


router.post('/post', upload.any(), function (req, res, next) {

    if (!(req.body.media_type == 'image') && !(req.body.media_type == 'video')) {
        var err = new Error('media type is wrong!');
        err.status = 'warn';
        err.statusCode = 404;
        next(err);
    } else {
        fs.writeFile('storage/' + req.body.media_type + '/' + req.body.name, req.files[0].buffer, function (error) {
            if (error) {
                var err = new Error('write file failure: ' + error.message);
                next(err);
            } else {
                logger.log('info', 'The file is saved! name: ' + req.body.name);
                res.sendStatus(200);
            }
        });
    }
});

router.delete('/delete/:media_type/:name', jwtauth, function (req, res, next) {
    file = 'storage/' + req.params.media_type + '/' + req.params.name;
    try {
        fs.accessSync(file, fs.F_OK);
        fs.unlinkSync(file);
        logger.log('info', 'file deleted: ' + file);
        res.sendStatus(200);
    } catch (error) {
        var err = new Error('delete file failure: ' + error.message);
        err.statusCode = 404;
        next(err);
    }

});

router.get('/get/metrics/:media_type1/:name1/:media_type2/:name2', jwtauth, function (req, res, next) {

    var file1 = 'storage/' + req.params.media_type1 + '/' + req.params.name1;
    var file2 = 'storage/' + req.params.media_type2 + '/' + req.params.name2;

    if (fs.existsSync(file2)) {
        var stats = fs.statSync(file2);
        var fileSizeInBytes = parseInt(stats["size"]);

        ffmpeg(file1).input(file2)
            .complexFilter(['ssim; [0:v][1:v]psnr'])
            .output('storage/tmp.mp4')
            .on('error', function (error, stdout, stderr) {
                var err = new Error('cannot compute ssim or psrn: ' + error.message);
                err.statusCode = 404;
                next(err);
            })
            .on('end', function (stdout, stderr) {
                regex = /SSIM[\s\S]* All:([0-9]*[.][0-9]*)/g;
                ssim = regex.exec(stderr);

                regex = /PSNR[\s\S]* average:([0-9]*[.][0-9]*)/g;
                psnr = regex.exec(stderr);

                res.json({'SSIM': ssim[1], 'PSNR': psnr[1], 'size': fileSizeInBytes}, 200);

            }).run();
    }


});


module.exports = router;