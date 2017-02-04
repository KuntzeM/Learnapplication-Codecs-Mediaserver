var mysql = require('mysql');
var config = require('./../config.json');
var logger = require('./../functions/logger');

module.exports = {

    saveMedia: function (req, res, next) {
        req.file_path = path.join(config.storage.path, req.body.media_type);
        var timestamp = new Date();

        var time = timestamp.toISOString().slice(0, 19).replace('T', ' ');
        req.file_name = encodeURI(path.join(req.file_path, timestamp.getTime() + '_' + req.files[0].originalname));

        if (req.body.name === "") {
            var name = 'unnamed';
        } else {
            var name = mysql.escape(req.body.name).substr(1, mysql.escape(req.body.name).length - 2);
        }

        connection.query({
            sql: "INSERT INTO " + config.mysql.prefix + "media " +
            "(media_type, name, active, demo, owner, manifest, origin_file, created_at, updated_at)" +
            " VALUES " +
            "(?, ?, 1, 1, ?, '', ?, ?, ?)",
            values: [req.body.media_type, name, req.decoded.sub, req.file_name, time, time]
        }, function (err, results) {
            if (err) {
                logger.log('error', 'sql failure: ' + this.sql);
                res.send(JSON.stringify({success: false, message: err.message}));
                return;
            } else {
                req.media_id = results.insertId;
                logger.log('info', 'media file with id ' + req.media_id + ' is saved!');

                next();
            }


        });
    },
    searchMedia: function (req, res, next) {
        connection.query({
            sql: "SELECT origin_file, media_type FROM " + config.mysql.prefix + "media WHERE media_id=?",
            values: [req.params.id]
        }, function (err, results) {
            if (err) {
                logger.log('error', 'sql failure: ' + this.sql);
                res.send(JSON.stringify({success: false, message: err.message}));
                return;
            } else {
                req.media_path = results[0].origin_file;
                req.media_type = results[0].media_type;
                next();
            }
        });
    },
    searchMediaConfig: function (req, res, next) {
        connection.query({
            sql: "SELECT c.convert, mcc.file_path as file_path, m.media_type as media_type, mcc.size FROM " + config.mysql.prefix + "media_codec_configs mcc " +
            "LEFT JOIN  " + config.mysql.prefix + "media m " +
            "ON m.media_id = mcc.media_id " +
            "LEFT JOIN  " + config.mysql.prefix + "codec_configs cc " +
            "ON mcc.codec_config_id = cc.codec_config_id " +
            "LEFT JOIN  " + config.mysql.prefix + "codecs c " +
            "ON cc.codec_id = c.codec_id " +
            "WHERE mcc.media_codec_config_id = ?",
            values: [req.params.media_config]
        }, function (err, results) {
            if (err) {
                logger.log('error', 'sql failure: ' + this.sql);
                res.status(404).send(JSON.stringify({success: false}));

            } else if (results.length == 0) {
                logger.log('warn', 'no media file with this configuration founded. media_config_id: ' + req.params.media_config);
            } else {
                req.file_path = results[0].file_path;
                req.convert = results[0].convert;
                req.size = results[0].size;
                req.media_type = results[0].media_type;
                next();
            }
        });
    }
};
