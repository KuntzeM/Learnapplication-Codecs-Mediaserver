var mysql = require('mysql');
var config = require('./../config.json');
var express = require('express');
var app = express();
var fs = require('fs');
var imMagick = require('imagemagick');
var ffmpeg = require('fluent-ffmpeg');
var http = require('http');
var logger = require('./../functions/logger');


module.exports = {

    startVideoTranscoding: function (connection, codec) {
        var transcodeEvent = this;

        var outputname = codec.origin_file.split('.', 1)[0] + '_' + codec.codec + '_' + config.codec_config_id + '_' + codec.bitrate + '.' + codec.extension;
        var command = ffmpeg(codec.origin_file)
            .output(outputname)
            .videoCodec(codec.codec).videoBitrate(codec.bitrate)
            .inputOptions([
                '-strict -2'
            ]).noAudio()
            .on('start', function (commandLine) {
                logger.log('info', 'Spawned Ffmpeg with command: ' + commandLine);
            }).on('progress', function (progress) {
                console.log('Processing Job-id: ' + codec.id + ' - ' + progress.percent + '% done');
                connection.query({
                    sql: 'SELECT process FROM `' + config.mysql.prefix + 'jobs` ' +
                    'WHERE id = ?',
                    values: [codec.id]
                }, function (error, results) {
                    if (error != null) {
                        logger.log('error', 'sql failure: ' + this.sql);
                    } else {
                        if (results.length > 0) {
                            if (results[0].process <= progress.percent) {
                                connection.query({
                                    sql: 'UPDATE `' + config.mysql.prefix + 'jobs` SET ' +
                                    'process = ? ' +
                                    'WHERE id = ?',
                                    values: [progress.percent, codec.id]
                                }, function (error, results, fields) {
                                    if (error != null) {
                                        logger.log('error', 'sql failure: ' + this.sql);
                                    }
                                });
                            }
                        }
                    }

                });
            }).on('error', function (err, stdout, stderr) {
                logger.log('error', 'Cannot process video transcoding: ' + err.message);
            }).on('end', function (stdout, stderr) {
                logger.log('info', 'Transcoding succeed! media_id: ' + codec.media_id + ' / codec_config_id: ' + codec.codec_config_id);

                var stats = fs.statSync(outputname);
                var fileSizeInBytes = parseInt(stats["size"]);

                if (codec.video_exists > 0) {
                    var sql = 'UPDATE `' + config.mysql.prefix + 'media_codec_configs` SET ' +
                        'file_path = ?, ' +
                        'size = "?" ' +
                        'WHERE codec_config_id = ? AND media_id = ?';
                    var values = [outputname, fileSizeInBytes, codec.codec_config_id, codec.media_id];
                } else {
                    var sql = 'INSERT INTO `' + config.mysql.prefix + 'media_codec_configs`' +
                        ' (codec_config_id, media_id, file_path, size) VALUES (?, ?, ?, ?)';
                    var values = [codec.codec_config_id, codec.media_id, outputname, fileSizeInBytes];
                }

                connection.query({
                    sql: sql,
                    values: values
                }, function (error, results, fields) {
                    if (error != null) {
                        logger.log('error', 'sql failure: ' + this.sql);
                    } else {
                        if (!codec.convert) {
                            connection.query({
                                sql: 'DELETE FROM `' + config.mysql.prefix + 'jobs` WHERE id=?',
                                values: [codec.id]
                            }, function (error, results, fields) {
                                if (error != null) {
                                    logger.log('error', 'sql failure: ' + this.sql);
                                }
                                transcodeEvent.emit('prepareTranscoding', connection);
                            });
                        }
                    }
                });


                if (codec.convert) {
                    var flag = true;
                    var command = ffmpeg(outputname)
                        .output(outputname + '.mp4')
                        .videoCodec('libx264').videoBitrate(20000)
                        .inputOptions([
                            '-strict -2'
                        ]).noAudio()
                        .on('start', function (commandLine) {
                            logger.log('info', 'Spawned Ffmpeg with command: ' + commandLine);
                        }).on('progress', function (progress) {
                            console.log('Processing Job-id: ' + codec.id + ' - ' + progress.percent + '% done');
                            connection.query({
                                sql: 'SELECT process FROM `' + config.mysql.prefix + 'jobs` ' +
                                'WHERE id = ?',
                                values: [codec.id]
                            }, function (error, results) {
                                if (error != null) {
                                    logger.log('error', 'sql failure: ' + this.sql);
                                } else {
                                    if (results.length > 0) {
                                        if ((results[0].process <= progress.percent) || flag) {
                                            flag = false;
                                            connection.query({
                                                sql: 'UPDATE `' + config.mysql.prefix + 'jobs` SET ' +
                                                'process = ? ' +
                                                'WHERE id = ?',
                                                values: [progress.percent, codec.id]
                                            }, function (error, results, fields) {
                                                if (error != null) {
                                                    logger.log('error', 'sql failure: ' + this.sql);
                                                }
                                            });
                                        }
                                    }
                                }

                            });
                        }).on('error', function (err, stdout, stderr) {
                            logger.log('error', 'Cannot process video transcoding (second coding to h264): ' + err.message);
                        }).on('end', function (stdout, stderr) {
                            logger.log('info', 'Transcoding succeed! (second coding to h264) media_id: ' + codec.media_id + ' / codec_config_id: ' + codec.codec_config_id);
                            connection.query({
                                sql: 'DELETE FROM `' + config.mysql.prefix + 'jobs` WHERE id=?',
                                values: [codec.id]
                            }, function (error, results, fields) {
                                if (error != null) {
                                    logger.log('error', 'sql failure: ' + this.sql);
                                }
                                transcodeEvent.emit('prepareTranscoding', connection);
                            });
                        }).run();
                }


            }).run();

    },
    startImageTranscoding: function (connection, codec) {
        var transcodeEvent = this;

        var outputname = codec.origin_file.split('.', 1)[0] + '_' + codec.codec + '_' + codec.codec_config_id + '.' + codec.extension;

        if (codec.optional == "") {
            var options = [codec.origin_file, '-quality', codec.bitrate, outputname]
        } else {
            var options = [codec.origin_file, '-quality', codec.bitrate, codec.optional, outputname]
        }

        /*
         * transcode image
         */
        imMagick.convert(options, function (err, stdout) {
            if (err) {
                logger.log('error', 'imagemagick failure: ' + error.message);
            } else {

                logger.log('info', 'image transcoding was success!  media_id: ' + codec.media_id + ' / codec_config_id: ' + codec.codec_config_id);
                var stats = fs.statSync(outputname);
                var fileSizeInBytes = parseInt(stats["size"]);

                /*
                 * update (if exists) or insert file reference to database
                 */
                if (codec.video_exists > 0) {
                    var sql = 'UPDATE `' + config.mysql.prefix + 'media_codec_configs` SET ' +
                        'file_path = ?, ' +
                        'size = "?" ' +
                        'WHERE codec_config_id = ? AND media_id = ?';
                    var values = [outputname, fileSizeInBytes, codec.codec_config_id, codec.media_id];

                } else {
                    var sql = 'INSERT INTO `' + config.mysql.prefix + 'media_codec_configs`' +
                        ' (codec_config_id, media_id, file_path, size) VALUES (?, ?, ?, ?)';
                    var values = [codec.codec_config_id, codec.media_id, outputname, fileSizeInBytes];
                }

                /*
                 * if browser cannot show file, than image will be transcoded to png.
                 */
                if (codec.convert) {

                    var options = [outputname, outputname + '.png']
                    imMagick.convert(options, function (err, stdout) {
                        if (err) {
                            logger.log('error', 'imagemagick failure: ' + error.message);
                        } else {
                            logger.log('info', 'png version is transcoded!  media_id: ' + codec.media_id + ' / codec_config_id: ' + codec.codec_config_id);
                        }
                    });
                }

                /*
                 * delete job from queue
                 */
                connection.query({
                    sql: sql,
                    values: values
                }, function (error, results, fields) {
                    if (error != null) {
                        logger.log('error', 'sql failure: ' + this.sql);
                    } else {
                        connection.query({
                            sql: 'DELETE FROM `' + config.mysql.prefix + 'jobs` WHERE id=?',
                            values: [codec.id]
                        }, function (error, results, fields) {
                            if (error != null) {
                                logger.log('error', 'sql failure: ' + this.sql);
                            }

                            transcodeEvent.emit('prepareTranscoding', connection);
                        });
                    }
                });
            }
        });
    },

    prepareTranscoding: function (connection) {
        var transcodeEvent = this;
        connection.query({
            sql: 'SELECT * FROM `' + config.mysql.prefix + 'jobs` LIMIT 1'
        }, function (error, jobs, fields) {
            if (error != null) {
                logger.log('error', 'sql failure: ' + this.sql);
            }
            if (jobs.length == 1) {
                var job = jobs[0];

                connection.query({
                    sql: ' SELECT  c.extension as extension, c.ffmpeg_codec as ffmpeg_codec, c.convert, c.media_type as media_type, cc.ffmpeg_bitrate as ffmpeg_bitrate, cc.ffmpeg_parameters as ffmpeg_parameters FROM `' + config.mysql.prefix + 'codec_configs` as cc ' +
                    'LEFT JOIN `' + config.mysql.prefix + 'codecs` AS c ' +
                    'ON  cc.codec_id  = c.codec_id ' +
                    'WHERE cc.codec_config_id = ?',
                    values: [job.codec_config_id]
                }, function (error, codec_configs, fields) {
                    if (error != null) {
                        logger.log('error', 'sql failure: ' + this.sql);
                    } else {
                        var codec_config = codec_configs[0];
                        connection.query({
                            sql: 'SELECT m.origin_file, COUNT(mcc.media_codec_config_id) as num FROM ' + config.mysql.prefix + 'media m ' +
                            'LEFT JOIN ' + config.mysql.prefix + 'media_codec_configs mcc ' +
                            'ON mcc.media_id = m.media_id ' +
                            'WHERE m.media_id = ? AND mcc.codec_config_id = ?',
                            values: [job.media_id, job.codec_config_id]
                        }, function (error, medias, fields) {
                            if (error != null) {
                                logger.log('error', 'sql failure: ' + this.sql);
                            } else {
                                var media = medias[0];
                                var codec = {
                                    'codec': codec_config.ffmpeg_codec,
                                    'extension': codec_config.extension,
                                    'bitrate': codec_config.ffmpeg_bitrate,
                                    'optional': codec_config.ffmpeg_parameters,
                                    'media_type': codec_config.media_type,
                                    'origin_file': media.origin_file,
                                    'convert': codec_config.convert,
                                    'id': job.id,
                                    'media_id': job.media_id,
                                    'codec_config_id': job.codec_config_id,
                                    'video_exists': media['num']
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

            } else {
                logger.log('info', 'No jobs are in the queue. Transcoding process is stopping!');
                global.isRunningTranscoding = false;
            }
        });
    }
};


