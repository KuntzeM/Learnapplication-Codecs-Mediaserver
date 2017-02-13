var mysql = require('mysql');
var config = require('./../config.json');
var app = require('../app');
var JsonDB = require('node-json-db');
fs = require('fs');

module.exports = {
    debugLevel: 'info',
    log: function (level, message) {

        var levels = ['error', 'warn', 'info'];
        if (levels.indexOf(level) <= levels.indexOf(this.debugLevel)) {
            if (typeof message !== 'string') {
                message = JSON.stringify(message);
            }
            if (level == 'error') {
                console.error(level + ': ' + message);
            } else {
                console.log(level + ': ' + message);
            }

            time = new Date().toISOString().slice(0, 19).replace('T', ' ');

            var log = {
                'level': level,
                'message': message,
                'created_at': time
            };
            try {
                DB_Logs.push('/log[]', log, true);
            } catch (e) {
                fs.unlinkSync("storage/logs.json");
                global.DB_Logs = new JsonDB("storage/logs", true, true);
                DB_Logs.reload();
                DB_Logs.push('/log[]', log, true);
            }

        }
    }
};