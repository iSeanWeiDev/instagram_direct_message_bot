/**
 * @description Admin router.
 * @name admin.js
 * @version 2.1.2
 * @author Super-Sean1995
 */
'use strict';

var express = require('express');
var router = express.Router();

// Import related core files
var AdminController = require('../controllers/adminController');

/* POST admin update proxy listening. */
router.post('/update/proxy', AdminController.updateProxy);

/* POST admin delete proxy listening. */
router.post('/delete/proxy', AdminController.deleteProxy);

/* POST admin create proxy listening */
router.post('/create/proxy', AdminController.createProxy);

/* POST admin get bots by types */
router.post('/get/botsbytype', AdminController.getBotsByTypes);

// export module
module.exports = router;