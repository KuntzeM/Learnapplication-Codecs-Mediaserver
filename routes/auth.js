var express = require('express');
var router = express.Router();
var fs = require('fs');



router.use('/video', function (req, res, next) {


    res.json({success: true});
    console.log("add a video");
});
router.delete('/video/:id', function(req, res, next) {
    console.log("delete video with id " + req.params.id);
});


router.post('/image', function (req, res, next) {

    fs.writeFile("storage/images/test.jpg", req.files[0].buffer, function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
    res.json({success: true});
});

router.delete('/image/:id', function(req, res, next) {
    console.log("delete image with id " + req.params.id);
});

module.exports = router;
