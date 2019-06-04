/**
 * Board Route management file.
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
var BoardController = require('../controllers/boardController');

router.post('/get/init', BoardController.init);
router.post('/get/message/history', BoardController.getMessageHistory);

// Export module.
module.exports = router;