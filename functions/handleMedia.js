var mysql = require('mysql');
var config = require('./../config.json');

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

        connection = req.app.get("connection");

        connection.query({
            sql: "INSERT INTO " + config.mysql.prefix + "media " +
            "(media_type, name, active, demo, owner, manifest, origin_file, created_at, updated_at)" +
            " VALUES " +
            "(?, ?, 1, 1, ?, '', ?, ?, ?)",
            values: [req.body.media_type, name, req.decoded.sub, req.file_name, time, time]
        }, function (err, results) {
            if (err) {
                res.send(JSON.stringify({success: false, message: err.message}));
                //res.json({success: false, message: err.message});
                return;
            } else {
                connection.commit(function (err) {

                    if (err) {
                        res.json({success: false, message: err.message});
                    }
                });
                console.log('media in database success!');
                req.media_id = results.insertId;
                next();
            }


        });
    },
    searchMedia: function (req, res, next) {

        connection = req.app.get("connection");

        connection.query({
            sql: "SELECT origin_file, media_type FROM " + config.mysql.prefix + "media WHERE media_id=?",
            values: [req.params.id]
        }, function (err, results) {
            if (err) {
                res.send(JSON.stringify({success: false, message: err.message}));

                return;
            } else {
                connection.commit(function (err) {

                    if (err) {
                        res.send(JSON.stringify({success: false, message: err.message}));

                        return;
                    }
                });
                req.media_path = results[0].origin_file;
                req.media_type = results[0].media_type;
                next();
            }


        });
    },
    searchMediaConfig: function (req, res, next) {

        connection = req.app.get("connection");

        connection.query({
            sql: "SELECT c.convert, mcc.file_path as file_path, m.media_type as media_type FROM " + config.mysql.prefix + "media_codec_configs mcc " +
            "LEFT JOIN  " + config.mysql.prefix + "media m " +
            "ON m.media_id = mcc.media_id " +
            "LEFT JOIN  " + config.mysql.prefix + "codec_configs cc " +
            "ON mcc.codec_config_id = cc.codec_config_id " +
            "LEFT JOIN  " + config.mysql.prefix + "codecs c " +
            "ON cc.codec_id = c.codec_id " +
            "WHERE mcc.media_codec_config_id = ?",
            values: [req.params.media_config]
        }, function (err, results) {
            if (err || results.length == 0) {
                res.status(404).send(JSON.stringify({success: false}));

            } else {
                connection.commit(function (err) {

                    if (err) {
                        res.status(404).send(JSON.stringify({success: false, message: err.message}));
                    }
                });
                req.file_path = results[0].file_path;
                req.convert = results[0].convert;
                req.media_type = results[0].media_type;
                next();
            }


        });


        /*
        connection.query({
            sql: "SELECT mcc.file_path as file_path, m.media_type as media_type FROM " + config.mysql.prefix + "media_codec_configs mcc " +
            "LEFT JOIN  " + config.mysql.prefix + "media m " +
            "ON m.media_id = mcc.media_id " +
            "WHERE mcc.media_id=? AND mcc.codec_config_id=?",
            values: [req.params.media, req.params.config]
        }, function (err, results) {
            if (err) {
                res.send(JSON.stringify({success: false, message: err.message}));

                return;
            } else {
                connection.commit(function (err) {

                    if (err) {
                        res.send(JSON.stringify({success: false, message: err.message}));

                        return;
                    }
                });
                req.file_path = results[0].file_path;
                req.media_type = results[0].media_type;
                next();
            }


        });

         */
    }

};
