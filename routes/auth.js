var express = require('express');
var router = express.Router();
var fs = require('fs');
var config = require('../config.json');
var path = require('path');
var mysql = require('mysql');
var handleMedia = require('../functions/handleMedia');
router.use('/video', function (req, res, next) {


    res.json({success: true});
    console.log("add a video");
});
router.delete('/video/:id', function(req, res, next) {
    console.log("delete video with id " + req.params.id);
});


router.post('/image', handleMedia.saveMedia, function (req, res, next) {

    try {
        fs.mkdirSync(req.file_path);
    } catch (e) {
        if (e.code != 'EEXIST') {
            res.json({success: false, message: e.message});
        }
    }
    fs.writeFile(req.file_name, req.files[0].buffer, function (err) {
        if (err) {
            console.log(err);
            res.json({success: false, message: err.message});
        } else {
            console.log("The file was saved!");
            res.json({success: true, media_id: req.insertId});
        }

    });
});

router.delete('/image/:id', function(req, res, next) {
    console.log("delete image with id " + req.params.id);
});

module.exports = router;
