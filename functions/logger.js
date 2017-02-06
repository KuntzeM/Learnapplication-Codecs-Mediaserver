var mysql = require('mysql');
var config = require('./../config.json');
var app = require('../app');

module.exports = {
    debugLevel: 'info',
    log: function (level, message) {

        var levels = ['error', 'warn', 'info'];
        if (levels.indexOf(level) <= levels.indexOf(this.debugLevel)) {
            if (typeof message !== 'string') {
                message = JSON.stringify(message);
            }
            console.log(level + ': ' + message);
            time = new Date().toISOString().slice(0, 19).replace('T', ' ');

            var log = {
                'level': level,
                'message': message,
                'created_at': time
            };
            DB_Logs.push('/log[]', log, true);
        }
    }
};