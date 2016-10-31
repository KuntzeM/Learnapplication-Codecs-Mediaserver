var express = require('express');
var app = express();
var router = express.Router();
var jwt    = require('jwt-simple');

/* GET media files. */
router.get('/video', function(req, res, next) {
    console.log("find all videos");
});
router.get('/video/:id', function(req, res, next) {
    console.log("find all video " + req.params.id);
});
router.get('/image', function(req, res, next) {
    console.log("find all images");
});
router.get('/image/:id', function(req, res, next) {
    console.log("find all image " + req.params.id);
});
module.exports = router;
