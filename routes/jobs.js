var express = require('express');
var app = express();
var router = express.Router();
var jwt = require('jwt-simple');
var fs = require('fs');
var path = require('path');
var config = require('./../config.json');
var logger = require('./../functions/logger');
var mime = require('mime');

/**
 * RESTful API
 * startet den nächsten Kodierungsprozess, sollte keiner laufen.
 * @url  /jobs/startTranscoding
 * @method POST
 */
router.post('/startTranscoding', function (req, res, next) {

    if (global.isRunningTranscoding) {
        logger.log('info', 'ffmpeg is current running!');
        return res.json({success: true, message: 'ffmpeg is current running!'});
    } else {
        req.app.get('transcodeEvent').emit('prepareTranscoding');
        logger.log('info', 'ffmpeg is started!');
        return res.json({success: true, message: 'ffmpeg is started!'});
    }
});

/**
 * RESTful API
 * fordert eine Liste alle Kodierungsprozesse in der Warteschlange und laufende an
 * @url  /jobs/get
 * @method GET
 */
router.get('/get', function (req, res, next) {
    try {
        var jobs = DB_Jobs.getData('/job');

        if (jobs.length == 0) {
            throw new Exception('no jobs');
        }

        res.json({success: true, jobs: DB_Jobs.getData('/job')})
    } catch (e) {
        res.json({success: false, message: 'no jobs'})
    }

});

/**
 * RESTful API
 * speichert einen neuen Kodierungsprozess in der Warteschlange (jobs.json)
 * @url  /jobs/post
 * @method POST
 */
router.post('/post', function (req, res, next) {

    if (req.body.name != undefined) {
        var job = {
            media_type: req.body.media_type,
            name: req.body.name,
            codec: req.body.codec,
            bitrate: req.body.bitrate,
            optional: req.body.optional,
            output: req.body.output,
            convert: req.body.convert,
            progress: 0
        };
        DB_Jobs.push('/job[]', job, true);
    } else {

        var i = 0;
        while (req.body[i] != undefined) {
            var job = {
                media_type: req.body[i].media_type,
                name: req.body[i].name,
                codec: req.body[i].codec,
                bitrate: req.body[i].bitrate,
                optional: req.body[i].optional,
                output: req.body[i].output,
                convert: req.body[i].convert,
                progress: 0
            };
            DB_Jobs.push('/job[]', job, true);
            i++;
        }
    }

    req.app.get('transcodeEvent').emit('prepareTranscoding');

    res.sendStatus(200);
});

/**
 * RESTful API
 * löscht alle Kodierungsprozesse in der Warteschlange
 * @url  /jobs/delete
 * @method DELETE
 */
router.delete('/delete', function (req, res, next) {
    DB_Jobs.delete("/");
    res.sendStatus(200);
});
module.exports = router;