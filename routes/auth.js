var express = require('express');
var router = express.Router();
var fs = require('fs');
var config = require('../config.json');
var path = require('path');
var mysql = require('mysql');
var handleMedia = require('../functions/handleMedia');
var logger = require('./../functions/logger');


router.post('/startTranscoding', function (req, res, next) {

    if (global.isRunningTranscoding) {
        logger.log('info', 'ffmpeg is current running!');
        return res.json({success: true, message: 'ffmpeg is current running!'});
    } else {
        global.isRunningTranscoding = true;
        req.app.get('transcodeEvent').emit('prepareTranscoding', connection);
        logger.log('info', 'ffmpeg is started!');
        return res.json({success: true, message: 'ffmpeg is started!'});
    }
});

/*
router.post('/media', handleMedia.saveMedia, function (req, res, next) {
    try {
        fs.mkdirSync(req.file_path);
    } catch (err) {
        if (err.code != 'EEXIST') {
            logger.log('error', 'filesystem failure: ' + err.message);
            res.json({success: false, message: err.message});
        }
    }
    fs.writeFile(req.file_name, req.files[0].buffer, function (err) {
        if (err) {
            logger.log('error', 'write file failure: ' + err.message);
            res.json({success: false, message: err.message});
        } else {
            logger.log('info', 'The file is saved! media_id: ' + req.insertId);
            res.json({success: true, media_id: req.insertId});
        }
    });
});
 */
/*
router.delete('/media/:id', function (req, res, next) {
    connection.query({
        sql: 'SELECT m.origin_file, mcc.file_path FROM `medienprojekt_media` as m ' +
        'LEFT JOIN medienprojekt_media_codec_configs mcc ' +
        'ON mcc.media_id = m.media_id ' +
        'WHERE m.media_id = ?',
        values: [req.params.id]
    }, function (error, results, fields) {
        if (error != null) {
            logger.log('error', 'sql failure: ' + this.sql);
            return res.json({success: false, message: 'Failed to get sql response.'});
        }
        if (results.length > 0) {

            for (var i = 0; i < results.length; i++) {
                result = results[i];
                if (i == 0) {
                    try {
                        fs.accessSync(result.origin_file, fs.F_OK);
                        fs.unlinkSync(result.origin_file);
                    } catch (err) {
                        logger.log('error', 'delete file failure: ' + err.message);
                    }
                }
                if (result.file_path != null) {
                    try {
                        fs.accessSync(result.file_path, fs.F_OK);
                        fs.unlinkSync(result.file_path);
                    } catch (err) {
                        logger.log('error', 'delete file failure: ' + err.message);
                    }
                }

            }


            return res.json({success: true, media_id: req.params.id});
        } else {
            logger.log('error', 'No media file with this id exists!');
            res.json({success: false, message: 'No media file with this id exists!'});
        }
    });


});
 */
/*
 * RESTful for Logger
 */
router.get('/debugLevel', function (req, res, next) {
    res.json({success: true, debugLevel: logger.debugLevel});
    // res.send(logger.debugLevel);
});
router.post('/debugLevel', function (req, res, next) {
    var levels = ['error', 'warn', 'info'];
    if (levels.indexOf(req.body.debugLevel) >= 0) {
        logger.debugLevel = req.params.debugLevel;
        res.sendStatus(200);
    } else {
        logger.log('error', 'debugLevel doesn\'t exist!');
        res.sendStatus(404);
    }

});

module.exports = router;
