var mysql = require('mysql');
var config = require('./../config.json');
var app = require('../app');

module.exports = {
    debugLevel: 'warn',
    log: function (level, message) {

        var levels = ['error', 'warn', 'info'];
        if (levels.indexOf(level) >= levels.indexOf(this.debugLevel)) {
            if (typeof message !== 'string') {
                message = JSON.stringify(message);
            }
            console.log(level + ': ' + message);

            connection.query({
                sql: "INSERT INTO " + config.mysql.prefix + "log (level, message, created_at) VALUE (?, ?, ?",
                values: [level, message, new Date().toISOString().slice(0, 19).replace('T', ' ')]
            }, function (err, results) {
                console.log(err.message);
            });

        }

    }

};