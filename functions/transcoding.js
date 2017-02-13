var config = require('./../config.json');
var express = require('express');
var fs = require('fs');
var imMagick = require('imagemagick');
var ffmpeg = require('fluent-ffmpeg');
var http = require('http');
var logger = require('./../functions/logger');


module.exports = {

    startVideoTranscoding: function (data) {
        var transcodeEvent = this;

        var command = ffmpeg('storage/' + data.media_type + '/' + data.name)
            .output('storage/' + data.media_type + '/' + data.output)
            .videoCodec(data.codec).videoBitrate(data.bitrate)
            .inputOptions([
                '-strict -2'
                //data.optional
            ]).noAudio()
            .on('start', function (commandLine) {
                logger.log('info', 'Spawned Ffmpeg with command: ' + commandLine);
            }).on('progress', function (progress) {
                console.log('Processing Job: ' + data.output + ' - ' + progress.percent + '% done');
                if (progress.percent > DB_Jobs.getData('/job[0]/progress')) {
                    DB_Jobs.push('/job[0]/progress', progress.percent);
                }


            }).on('error', function (error, stdout, stderr) {
                logger.log('error', 'Cannot process video transcoding: ' + error.message);
            }).on('end', function (stdout, stderr) {
                logger.log('info', 'Transcoding succeed! input: ' + data.name + ' / output: ' + data.output);


                if (data.convert == 1) {
                    var flag = true;
                    var command = ffmpeg('storage/' + data.media_type + '/' + data.output)
                        .output('storage/' + data.media_type + '/' + data.output + '.mp4')
                        .videoCodec('libx264').videoBitrate(20000)
                        .inputOptions([
                            '-strict -2'
                        ]).noAudio()
                        .on('start', function (commandLine) {
                            logger.log('info', 'Spawned Ffmpeg with command: ' + commandLine);
                        }).on('progress', function (progress) {
                            console.log('Processing Job: ' + data.output + ' - ' + progress.percent + '% done');

                            if (progress.percent > DB_Jobs.getData('/job[0]/progress')) {
                                DB_Jobs.push('/job[0]/progress', progress.percent);
                            }

                        }).on('error', function (error, stdout, stderr) {
                            logger.log('error', 'Cannot process video transcoding (second coding to h264): ' + error.message);
                        }).on('end', function (stdout, stderr) {
                            logger.log('info', 'Transcoding succeed! (second coding to h264) input: ' + data.output + ' / output: ' + data.output + '.mp4');
                            DB_Jobs.delete('/job[0]');
                            isRunningTranscoding = false;
                            transcodeEvent.emit('prepareTranscoding');

                        }).run();
                } else {
                    DB_Jobs.delete('/job[0]');
                    isRunningTranscoding = false;
                    transcodeEvent.emit('prepareTranscoding');
                }


            }).run();

    },
    startImageTranscoding: function (data) {
        var transcodeEvent = this;


        if (data.optional == "") {
            var options = ['storage/' + data.media_type + '/' + data.name, '-quality', data.bitrate, 'storage/' + data.media_type + '/' + data.output]
        } else {
            var s = data.optional.split(" ");
            var options = new Array();
            options.push('storage/' + data.media_type + '/' + data.name);
            options.push('-quality');
            options.push(data.bitrate);
            options = options.concat(s);
            options.push('storage/' + data.media_type + '/' + data.output);
        }
        /**
         * transcode image
         */
        imMagick.convert(options, function (error, stdout) {
            if (error) {
                logger.log('error', 'imagemagick failure: ' + error.message);
            } else {

                logger.log('info', 'image transcoding was success!  input: ' + data.name + ' / output: ' + data.output);
                /**
                 * if browser cannot show file, than image will be transcoded to png.
                 */
                if (data.convert == "1") {

                    var options = ['storage/' + data.media_type + '/' + data.output, 'storage/' + data.media_type + '/' + data.output + '.png'];
                    imMagick.convert(options, function (error, stdout) {
                        if (error) {
                            logger.log('error', 'imagemagick failure: ' + error.message);
                        } else {
                            DB_Jobs.delete('/job[0]');
                            logger.log('info', 'image transcoding was success!  input: ' + data.output + ' / output: ' + data.output + '.png');
                            isRunningTranscoding = false;
                            transcodeEvent.emit('prepareTranscoding');
                        }
                    });
                } else {
                    DB_Jobs.delete('/job[0]');
                    isRunningTranscoding = false;
                    transcodeEvent.emit('prepareTranscoding');
                }


            }
        });
    },

    prepareTranscoding: function () {
        var transcodeEvent = this;

        if (!isRunningTranscoding) {
            logger.log('info', 'transcoding is current running!');

            try {
                var data = DB_Jobs.getData('/job[0]');
                isRunningTranscoding = true;
                if (data.media_type == 'video') {
                    transcodeEvent.emit('startVideoTranscoding', data);
                } else {
                    transcodeEvent.emit('startImageTranscoding', data);
                }
            } catch (error) {
                logger.log('info', 'No jobs are in the queue. Transcoding process is stopping!');
                isRunningTranscoding = false;
            }
        }
    },

    isRunningTranscoding: false
};


