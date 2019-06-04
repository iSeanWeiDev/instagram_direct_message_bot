/**
 * index Route management file.
 * index.js
 * 
 * created by super-sean
 * version 1.1.1
 */

'use strict';
var express = require('express');
var router = express.Router();

// Import main core libraries.
var BotService = require('../services/botService');
var DashBoardService = require('../services/dashBoardService');

/* GET login page. */
router.get('/', function(req, res) {
  if(req.session.authenticated) {
     res.redirect('dashboard');
  }
  
  res.render('pages/login');
});

/* GET signup page. */
router.get('/signup', function(req, res) {
  if(req.session.authenticated) {
    res.redirect('dashboard');
 }
 
  res.render('pages/signup');
});

/* GET logout page. */
router.get('/logout',function (req, res) {
  req.session.destroy();
   res.redirect('/');
});

/* GET connect bot page. */
router.get('/connect', isAuthenicated, function(req, res) {
  res.render('pages/connect', {user: req.session.user});
});


/* GET Dashboard page. */
router.get('/dashboard', isAuthenicated, function(req, res) {
  DashBoardService.getBotDetails(req.session.user.id, function(data) {
    res.render('pages/dashboard', {user: req.session.user, data: data});
  });
});

/* GET all bots page. */
router.get('/allbots', isAuthenicated, function(req, res) {
  BotService.getAllBot(req.session.user.id, function(cb) {
    res.render('pages/allbots', {user: req.session.user, data: cb});
  });
});




function isAuthenicated(req, res, next) {
  if(req.session.authenticated) {
    return next();
  }

  return res.redirect('/');
}

module.exports = router;
