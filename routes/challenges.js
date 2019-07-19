/**
 * @description User router.
 * @name challenges.js
 * @version 2.1.2
 * @author Super-Sean1995
 */
'use strict';

var express = require('express');
var router = express.Router();

// Import related core files
var ChallengeController = require('../controllers/challengeController');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/dropdown/notification', ChallengeController.getDropDownNotification);
router.post('/read/notification', ChallengeController.readNotification);

module.exports = router;