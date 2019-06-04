/**
 * api Route management file.
 * api.js
 * 
 * created by super-sean
 * version 1.1.1
 */
'use strict';

// Import npm modules
const express = require('express');
const router = express.Router();

// Import related core files
const ApiController = require('../controllers/apiController');

/* POST method listen */
router.post('/signup', ApiController.signup);
router.post('/login', ApiController.login);


/* GET method listen */

module.exports = router;