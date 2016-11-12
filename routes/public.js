var express = require('express');
var app = express();
var router = express.Router();
var jwt    = require('jwt-simple');
fs = require('fs');
path = require('path');
var config = require('./../config.json');
var upload = require('jquery-file-upload-middleware');
var handleMedia = require('../functions/handleMedia');

/* GET media files. */
router.get('/media/:id', handleMedia.searchMedia, function (req, res, next) {
    try {
        var img = fs.readFileSync(req.media_path);
        res.writeHead(200);
        res.end(img, 'binary');
    } catch (err) {
        res.json({success: false, message: err.code});
    }
});

/*

upload.configure({
    uploadDir: 'storage/images',
    uploadUrl: '/image',
    imageVersions: {
        thumbnail: {
            width: 80,
            height: 80
        }
    }
});

router.use('/image', upload.fileHandler());
 */

module.exports = router;
