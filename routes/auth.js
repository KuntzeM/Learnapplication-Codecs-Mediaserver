var express = require('express');
var router = express.Router();
var fs = require('fs');
var config = require('../config.json');
var path = require('path');
var mysql = require('mysql');
var handleMedia = require('../functions/handleMedia');


router.post('/startTranscoding', function (req, res, next) {

    if (global.isRunningTranscoding) {
        return res.json({success: true, message: 'ffmpeg is running!'});
    } else {
        global.isRunningTranscoding = true;
        req.app.get('transcodeEvent').emit('prepareTranscoding', connection);
        return res.json({success: true, message: 'ffmpeg is started!'});
    }

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
    connection = req.app.get("connection");

    connection.query({
        sql: 'SELECT m.origin_file, mcc.file_path FROM `medienprojekt_media` as m ' +
        'LEFT JOIN medienprojekt_media_codec_configs mcc ' +
        'ON mcc.media_id = m.media_id ' +
        'WHERE m.media_id = ?',
        values: [req.params.id]
    }, function (error, results, fields) {
        if (error != null) {
            console.log("Error: " + error);
            return res.json({success: false, message: 'Failed to get sql response.'});
        }
        if (results.length > 0) {

            for (var i = 0; i < results.length; i++) {
                result = results[i];
                if (i == 0) {
                    try {
                        fs.accessSync(result.origin_file, fs.F_OK);
                        fs.unlinkSync(result.origin_file);
                    } catch (e) {
                        console.log(e.message);
                    }
                }
                if (result.file_path != null) {
                    try {
                        fs.accessSync(result.file_path, fs.F_OK);
                        fs.unlinkSync(result.file_path);
                    } catch (e) {
                        console.log(e.message);
                    }
                }

            }


            return res.json({success: true, media_id: req.params.id});
        } else {
            res.json({success: false, message: 'No media file with this id exists!'});
        }
    });


});

module.exports = router;
