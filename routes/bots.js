/**
 * User Route management file.
 * bots.js
 * 
 * created by super-sean
 * version 2.1.1
 */
'use strict';

var express = require('express');
var router = express.Router();

// Import sub project files.
var BotController = require('../controllers/botController');

router.post('/validate', BotController.validateBot);
router.post('/save/filters', BotController.saveFilters);
router.post('/save/comment', BotController.saveComment);
router.post('/save/reply', BotController.saveReply);
router.post('/save/fum', BotController.saveFUMessage);
router.post('/save/setting', BotController.saveSettings);

module.exports = router;