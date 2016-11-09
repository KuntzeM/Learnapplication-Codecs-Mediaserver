var mysql      = require('mysql');
var config = require('./../config.json');

module.exports = function() {

    var connection = mysql.createConnection({
        host     : config.mysql.host,
        user     : config.mysql.user,
        password : config.mysql.pass,
        database : config.mysql.database
    });

    connection.connect(function(err) {              // The server is either down
        if(err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err.code);
            var dbconnection = require('./connectMysql')
            setTimeout(dbconnection, 2000); // We introduce a delay before attempting to reconnect,
        } else {
            console.log('database is connected.')
        }                                   // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.

    return connection;
};