var jwt = require('jwt-simple');
var mysql      = require('mysql');
var config = require('./../config.json');
var upload = require('jquery-file-upload-middleware');
var logger = require('./../functions/logger');

module.exports = function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (req.method == 'OPTIONS') {
        next();
    } else {

        // decode token
        if (token) {
            try {
                var decoded = jwt.decode(token, req.app.get('jwtTokenSecret'), true);
                req.decoded = decoded;

                if (req.decoded.token == req.app.get('jwtTokenSecret')) {
                    next();
                } else {
                    logger.log('warn', 'Failed to authenticate token.');
                    return res.status(403).send({success: false, message: 'Failed to authenticate token.'});
                }
            } catch (err) {
                logger.log('warn', 'Failed to authenticate token.');
                return res.status(403).send({success: false, message: 'Failed to authenticate token.'});
            }


        } else {
            logger.log('warn', 'No token provided.');
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });

        }
    }
};
