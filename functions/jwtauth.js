var jwt = require('jwt-simple');
var mysql      = require('mysql');
var config = require('./../config.json');
var upload = require('jquery-file-upload-middleware');
module.exports = function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {
        try {
            var decoded    = jwt.decode(token, req.app.get('jwtTokenSecret'), true);
            req.decoded = decoded;
            next();
            connection = req.app.get("connection");

            connection.query({
                sql: 'SELECT * FROM `' + config.mysql.prefix + 'users` WHERE `id` = ? and `password` = ?',
                values: [decoded.sub, decoded.password]
            }, function (error, results, fields) {
                if(error != null){
                    console.log("Error: " + error);
                    return res.json({ success: false, message: 'Failed to get sql response.'});
                }
                if(results.length == 1){
                    req.decoded = decoded;
                    next();
                }else{
                    return res.json({ success: false, message: 'User doesn\'t exist!'});
                }
            });

        } catch (err){

            return res.json({ success: false, message: 'Failed to authenticate token.' });
        }


    } else {

        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

    }
};
