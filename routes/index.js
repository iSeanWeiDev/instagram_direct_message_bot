/**
 * index Route management file.
 * index.js
 * 
 * created by super-sean
 * version 2.1.1
 */

'use strict';

var express = require('express');
var router = express.Router();

/* GET login page. */
router.get('/', function(req, res) {
  if(req.session.authenticated) {
    res.redirect('dashboard');
  }
  
  res.render('pages/auth/login');
});

/* GET signup page. */
router.get('/signup', function(req, res) {
  if(req.session.authenticated) {
    res.redirect('dashboard');
 }
 
  res.render('pages/auth/signup');
});

/* GET logout page. */
router.get('/logout',function (req, res) {
  req.session.destroy();
   res.redirect('/');
});

/* GET dashboard page. */
router.get('/dashboard', isAuthenicated, function(req, res) {
  res.render('pages/dashboard', {user: req.session.user});
});

/* GET allbots page. */
router.get('/allbots', isAuthenicated, function(req, res) {
  res.render('pages/allbots', {user: req.session.user});
});

/* GET createbot page. */
router.get('/createbot', isAuthenicated, function(req, res) {
  res.render('pages/createbot', {user: req.session.user});
});

/* GET schedule page. */
router.get('/schedule', isAuthenicated, function(req, res) {
  res.render('pages/schedule', {user: req.session.user});
});

/* Validate authenticated user. */
function isAuthenicated(req, res, next) {
  if(req.session.authenticated) {
    return next();
  }

  return res.redirect('/');
}

module.exports = router;
