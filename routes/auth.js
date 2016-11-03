var express = require('express');
var router = express.Router();
upload = require('jquery-file-upload-middleware');


router.use('/video', function (req, res, next) {
    upload.fileHandler({
        uploadDir: __dirname + '/public/uploads2',
        uploadUrl: '/uploads2',
        imageVersions: {
            thumbnail: {
                width: 100,
                height: 100
            }
        }
    });

    res.json({ success: true, message: req.decoded.sub});
    console.log("add a video");
});
router.delete('/video/:id', function(req, res, next) {
    console.log("delete video with id " + req.params.id);
});
router.post('/image', function(req, res, next) {
    console.log("add an image");
});
router.delete('/image/:id', function(req, res, next) {
    console.log("delete image with id " + req.params.id);
});

module.exports = router;
