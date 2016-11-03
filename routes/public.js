var express = require('express');
var app = express();
var router = express.Router();
var jwt    = require('jwt-simple');
fs = require('fs');
path = require('path');
var config = require('./../config.json');
var upload = require('jquery-file-upload-middleware');
/* GET media files. */
router.get('/video', function(req, res, next) {
    try {
        var img = fs.readFileSync(path.join(config.storage.path, 'images', 'f.png'));
        res.writeHead(200);
        res.end(img, 'binary');
    } catch (err) {
        res.json({success: false, message: err.code});
    }
});
router.get('/video/:id', function(req, res, next) {
    console.log("find all video " + req.params.id);
});
router.post('/image', function (req, res, next) {
    req.filemanager = upload.fileManager();
    console.log("find all images");
    //res.json({ success: true, message: 'success'});
    res.send('success');
});
router.get('/image/:id', function(req, res, next) {
    console.log("find all image " + req.params.id);
});
module.exports = router;
