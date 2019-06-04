/**
 * Bots Route management file.
 * api.js
 * 
 * created by super-sean
 * version 1.1.1
 */
'use strict';

// Import npm modules.
var express = require('express');
var router = express.Router();

// Import sub project files.
var BotController = require('../controllers/botController');

// Post listening
router.post('/validate', BotController.validateBot);
router.post('/save/filters', BotController.saveFilters);
router.post('/add/comment', BotController.addComment);
router.post('/add/message', BotController.addMessage);
router.post('/set/max', BotController.setCountMaxComment);
router.post('/create/new', BotController.createNewBot);
router.post('/get/loadmore', BotController.getLoadMoreDetails);
router.post('/delete', BotController.deleteBotById);
// router.post('/update/all', BotController.updateBotAllDetails);
// router.post('/dmhistory', BotController.getBotDirectMessageHistroy);

// router.post('/switch', BotController.switchBot);

// Export module.
module.exports = router;