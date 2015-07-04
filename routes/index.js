var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Jollen' });
});

router.get('/hello/:message', function(req, res, next) {
  res.render('index', { title: req.body.name });
});

module.exports = router;
