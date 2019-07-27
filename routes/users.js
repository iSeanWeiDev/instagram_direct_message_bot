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

/* POST user save by admin */
router.post('/save', UserController.saveUser);

/* POST user delete by amdin */
router.post('/delete', UserController.deleteUser);

/* POST create new user by admin */
router.post('/create', UserController.createUser);

/* POST update current user profile */
router.post('/update/profile', UserController.saveProfilebyId);


module.exports = router;