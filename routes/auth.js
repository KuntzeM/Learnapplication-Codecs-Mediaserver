var express = require('express');
var router = express.Router();
var upload = require('jquery-file-upload-middleware');

router.use('/video', function (req, res, next) {


    res.json({success: true});
    console.log("add a video");
});
router.delete('/video/:id', function(req, res, next) {
    console.log("delete video with id " + req.params.id);
});

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


router.delete('/image/:id', function(req, res, next) {
    console.log("delete image with id " + req.params.id);
});

module.exports = router;
