/**
 * @description User router.
 * @name users.js
 * @version 2.1.2
 * @author Super-Sean1995
 */
'use strict';

var express = require('express');
var router = express.Router();

// Import related core files
var UserController = require('../controllers/userController');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* POST users signup listing. */
router.post('/signup', UserController.signup);

/* POST users login listing. */
router.post('/login', UserController.login);

module.exports = router;