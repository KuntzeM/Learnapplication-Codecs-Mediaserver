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
        if (fs.existsSync(file + '.png')) {
            file = file + '.png';
        }
        if (fs.existsSync(file + '.mp4')) {
            file = file + '.mp4';
        }
        type = mime.lookup(file);
        res.writeHead(200, {'Content-Type': type});
        res.end(fs.readFileSync(file), 'binary');
    } else {
        res.sendStatus(404);
    }

});


router.post('/post', upload.any(), function (req, res, next) {

    if (!(req.body.media_type == 'image') && !(req.body.media_type == 'video')) {
        res.sendStatus(404);
    } else {
        fs.writeFile('storage/' + req.body.media_type + '/' + req.body.name, req.files[0].buffer, function (err) {
            if (err) {
                logger.log('error', 'write file failure: ' + err.message);
                res.json({success: false, message: err.message});
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
    } catch (err) {
        logger.log('error', 'delete file failure: ' + err.message);
        res.sendStatus(404);
    }

});
module.exports = router;