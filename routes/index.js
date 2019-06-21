var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('pages/auth/login');
});

router.get('/signup', function(req, res) {
  res.render('pages/auth/signup');
});

router.get('/dashboard', function(req, res) {
  res.render('pages/dashboard');
});

router.get('/allbots', function(req, res) {
  res.render('pages/allbots');
});

router.get('/createbot', function(req, res) {
  res.render('pages/createbot');
});

router.get('/schedule', function(req, res) {
  res.render('pages/schedule');
});

module.exports = router;
