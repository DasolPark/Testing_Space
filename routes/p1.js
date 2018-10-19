var express = require('express');
var router = express.Router();

router.get('/r1', function(req, res){
	res.send('p1 r1 11');
});
router.get('/r2', function(req, res){
	res.send('p1 r2 22');
});

module.exports = router;