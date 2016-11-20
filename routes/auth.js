var express = require('express');
var router = express.Router();
var fs = require('fs');
var config = require('../config.json');
var path = require('path');
var mysql = require('mysql');
var handleMedia = require('../functions/handleMedia');


router.post('/startTranscoding', function (req, res, next) {
    connection = req.app.get("connection");

    connection.query({
        sql: 'SELECT attempts FROM `' + config.mysql.prefix + 'jobs` WHERE `reserved_at` = NULL'
    }, function (error, results, fields) {
        if (error != null) {
            console.log("Error: " + error);
            return res.json({success: false, message: 'Failed to get sql response.'});
        }
        if (results.length > 0) {
            return res.json({success: true, message: 'ffmpeg is running!'});
        } else {
            req.app.get('transcodeEvent').emit('prepareTranscoding', connection);
            return res.json({success: true, message: 'ffmpeg is started!'});
        }
    });


});


router.post('/media', handleMedia.saveMedia, function (req, res, next) {

    try {
        fs.mkdirSync(req.file_path);
    } catch (e) {
        if (e.code != 'EEXIST') {
            res.json({success: false, message: e.message});
        }
    }
    fs.writeFile(req.file_name, req.files[0].buffer, function (err) {
        if (err) {
            console.log(err);
            res.json({success: false, message: err.message});
        } else {
            console.log("The file was saved!");
            res.json({success: true, media_id: req.insertId});
        }

    });
});

router.delete('/media/:id', function (req, res, next) {
    console.log("delete image with id " + req.params.id);
});

module.exports = router;
