var jwt = require('jwt-simple');
var mysql      = require('mysql');
var config = require('./../config.json');
var upload = require('jquery-file-upload-middleware');
var logger = require('./../functions/logger');

/**
 * Überprüft den mitgesendeten Token. Ist der Token nicht korrekt wird ein HTTP Fehlercode zurück gesendet.
 * 401: Token nicht korrekt
 * 403: Token nicht vorhanden
 * Ist die Authentifikation korrekt, wird die Anfrage weiter gesendet
 * @param req
 * @param res
 * @param next
 */
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
                    var err = new Error('Failed to authenticate token.');
                    err.statusCode = 401;
                    next(err);
                }
            } catch (err) {
                var err = new Error('Failed to authenticate token.');
                err.statusCode = 401;
                next(err);
            }


        } else {
            var err = new Error('No token provided.');
            err.statusCode = 403;
            next(err);
        }
    }
};
