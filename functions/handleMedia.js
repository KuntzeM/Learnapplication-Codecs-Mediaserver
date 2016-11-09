var mysql = require('mysql');
var config = require('./../config.json');

module.exports = {

    saveMedia: function (req, res, next) {
        req.file_path = path.join(config.storage.path, req.body.media_type);
        var time = Date.now();
        req.file_name = path.join(req.file_path, time.toString() + '_' + req.files[0].originalname);

        if (req.body.name === "") {
            var name = 'unnamed';
        } else {
            var name = mysql.escape(req.body.name);
        }

        connection = req.app.get("connection");

        connection.query({
            sql: "INSERT INTO " + config.mysql.prefix + "media SET " +
            "media_type=?, " +
            "name=?, " +
            "active=1, " +
            "demo=1, " +
            "owner=?, " +
            "origin_file=?, " +
            "created_at=?, " +
            "updated_at=?",
            values: [req.body.media_type, name, req.decoded.sub, req.file_path, time, time]
        }, function (err, results) {
            if (err) {
                res.json({success: false, message: err.message});
                return connection.rollback(function () {
                    res.json({success: false, message: err.message});
                    //throw err;
                });
            }
            connection.commit(function (err) {

                if (err) {
                    res.json({success: false, message: err.message});
                    return connection.rollback(function () {
                        //throw err;
                        res.json({success: false, message: err.message});
                    });
                }
            });
            console.log('media in database success!');
            req.media_id = results.insertId;
            next();

        });
    }

};
