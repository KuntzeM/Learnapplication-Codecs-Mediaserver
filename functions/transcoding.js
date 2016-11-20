var mysql = require('mysql');
var config = require('./../config.json');
var express = require('express');
var app = express();
var imMagick = require('imagemagick');
var ffmpeg = require('fluent-ffmpeg');
var http = require('http');

module.exports = {

    startVideoTranscoding: function (connection, codec) {
        var transcodeEvent = this;

        var outputname = codec.origin_file.split('.', 1)[0] + '_' + codec.codec + '_' + codec.bitrate + '.' + codec.extension;
        var command = ffmpeg(codec.origin_file)
            .output(outputname)
            .videoCodec(codec.codec).videoBitrate(codec.bitrate)
            .inputOptions([
                '-strict -2'
            ]).noAudio()
            .on('start', function (commandLine) {
                console.log('Spawned Ffmpeg with command: ' + commandLine);
            }).on('progress', function (progress) {
                console.log('Processing: ' + '0' + '% done');
            }).on('error', function (err, stdout, stderr) {
                console.log('Cannot process video: ' + err.message);
                console.log(stderr);
            }).on('end', function (stdout, stderr) {
                console.log('Transcoding succeeded !');

                connection.query({
                    sql: 'INSERT INTO `' + config.mysql.prefix + 'media_codec_configs`' +
                    ' (codec_config_id, media_id, file_path) VALUES (?, ?, ?)',
                    values: [codec.codec_config_id, codec.media_id, outputname]
                }, function (error, results, fields) {
                    if (error != null) {
                        console.log("Error: " + error);
                    } else {
                        connection.query({
                            sql: 'DELETE FROM `' + config.mysql.prefix + 'jobs` WHERE id=?',
                            values: [codec.id]
                        }, function (error, results, fields) {
                            if (error != null) {
                                console.log("Error: " + error);
                            }

                            transcodeEvent.emit('prepareTranscoding', connection);


                        });
                    }


                });

            }).run();

    },

    prepareTranscoding: function (connection) {
        var transcodeEvent = this;
        connection.query({
            sql: 'SELECT * FROM `' + config.mysql.prefix + 'jobs` LIMIT 1'
        }, function (error, jobs, fields) {
            if (error != null) {
                console.log("Error: " + error);

            }
            if (jobs.length == 1) {
                var job = jobs[0];

                connection.query({
                    sql: ' SELECT  c.extension as extension, c.ffmpeg_codec as ffmpeg_codec,  c.media_type as media_type, ffmpeg_bitrate, ffmpeg_parameters FROM `' + config.mysql.prefix + 'codec_configs`' +
                    'LEFT JOIN `medienprojekt_codecs` AS c ' +
                    'ON  medienprojekt_codec_configs.codec_id  = c.codec_id ' +
                    'WHERE codec_config_id = ?',
                    values: [job.codec_config_id]
                }, function (error, codec_configs, fields) {
                    if (error != null) {
                        console.log("Error: " + error);

                    } else {
                        var codec_config = codec_configs[0];
                        connection.query({
                            sql: ' SELECT  origin_file FROM `' + config.mysql.prefix + 'media`' +
                            'WHERE media_id = ?',
                            values: [job.media_id]
                        }, function (error, medias, fields) {
                            if (error != null) {
                                console.log("Error: " + error);

                            } else {
                                var media = medias[0];
                                var codec = {
                                    'codec': codec_config.ffmpeg_codec,
                                    'extension': codec_config.extension,
                                    'bitrate': codec_config.ffmpeg_bitrate,
                                    'optional': codec_config.ffmpeg_parameters,
                                    'media_type': codec_config.media_type,
                                    'origin_file': media.origin_file,
                                    'id': job.id,
                                    'media_id': job.media_id,
                                    'codec_config_id': job.codec_config_id
                                };

                                if (codec.media_type == 'video') {
                                    transcodeEvent.emit('startVideoTranscoding', connection, codec);
                                } else {
                                    transcodeEvent.emit('startImageTranscoding', connection, codec);
                                }
                            }
                        });
                    }


                });

            }
        });


    }


};


