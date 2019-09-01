 /**
 * @description index Route management file.
 * @name index.js
 * @version 2.1.2
 * @author Super-Sean1995
 */

'use strict';

var express = require('express');
var router = express.Router();

// import service files.
var ProxyService = require('../services/proxyService');
var BotService = require('../services/botService');
var UserService = require('../services/userService');
var ChallengeService = require('../services/challengeService');
var UserManagerController = require('../controllers/userManagerController');

/* GET login page. */
router.get('/', function(req, res) {
  if(req.session.authenticated) {
    res.redirect('dashboard');
  }

  res.render('pages/home');
});

/* GET login page. */
router.get('/login', function(req, res) {
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

/* GET profile page. */
router.get('/profile', isAuthenicated, function(req, res) {
  UserService.getUserDetail(req.session.user.userId, function (cb) {
    res.render('pages/profile', {user: req.session.user, data: cb});
  });
});

/* GET dashboard page. */
router.get('/dashboard', isAuthenicated, function(req, res) {
  BotService.getBotHistoryData(req.session.user.userId, function(cb) {
    res.render('pages/dashboard', {user: req.session.user, data: cb});
  });

  
});

/* GET allbots page. */
router.get('/allbots', isAuthenicated, function(req, res) {
  BotService.getAllBotsDetail(req.session.user.userId, function(cb) {
    res.render('pages/allbots', {user: req.session.user, data: cb});
  });
});

/* GET createbot page. */
router.get('/createbot', isAuthenicated, function(req, res) {
  res.render('pages/createbot', {user: req.session.user});
});

/* GET schedule page. */
router.get('/schedule', isAuthenicated, function(req, res) {
  res.render('pages/schedule', {user: req.session.user});
});

/* GET notifications page. */
router.get('/notifications', isAuthenicated, function(req, res) {
  ChallengeService.getInitialNotifications(req.session.user.userId, function (cb) {
    if(cb.flag == true) {
      res.render('pages/notifications', {user: req.session.user, data: cb.data});
    }
  })
});

/* Admin route */
router.get('/admin-proxy', isAuthenicated, function(req, res) {
  ProxyService.getAllProxies(function(cb) {
    if(req.session.user.role == 5) {
      res.render('pages/admin/proxy', {user: req.session.user, data: cb});
    } else {
      res.redirect('dashboard');
    }
  });
});

router.get('/admin-user', isAuthenicated, function(req, res) {
  UserService.getAllUsers(function(cb) {
    if(req.session.user.role == 5) {
      res.render('pages/admin/user', {user: req.session.user, data: cb});
    } else {
      res.redirect('dashboard');
    }
  });
});

router.get('/admin-bot', isAuthenicated, function(req, res) {
  UserService.getAllUsersDetail(function (cb) {
    if(req.session.user.role == 5) {
      res.render('pages/admin/bot', {user: req.session.user, data: cb});
    } else {
      res.redirect('dashboard');
    }
  })
});

/* Maintance model */
router.get('/maintance', (req, res) => {
  res.send('You can not access this platform! <a href="/">Click here to return.</a>');
});

/* Validate authenticated user. */
function isAuthenicated(req, res, next) {
  if(req.session.authenticated) {
    return next();
  }

  return res.redirect('/');
}

module.exports = router;



