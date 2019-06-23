/**
 * user controller.
 * botController.js
 * 
 * created by super-sean
 * version 2.1.1
 */
'use strict';
// Import npm modules.
var fork = require('child_process').fork,
    path = require('path');

// Import project modules.
var BotService = require('../services/botService');

// Define user controller.
var BotController = {};

// Validate bot by IG account detail and proxy.
BotController.validateBot = function(req, res) {
    var botName = req.body.botName,
        accountName = req.body.accountName,
        accountPass = req.body.accountPassword,
        proxyUrl = req.body.proxyUrl;

    if(proxyUrl == '') {
        BotService.getProxy(function(cb) {
            console.log(cb)
        });

        console.log(objProxy);
    } else {
        console.log('proxyUrl got');
    }
}

BotController.saveFilters = function(req, res) {

}

BotController.saveComment = function(req, res) {

}

BotController.saveReply = function(req, res) {

}

BotController.saveFUMessage = function(req, res) {

}

BotController.saveSettings = function(req, res) {

}

// Export module with UserController.
module.exports = BotController;