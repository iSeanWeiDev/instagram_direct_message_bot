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

// Global values.
var arrBotProcess = [];
var arrBotProcessName = [];
var arrBotProcessBackup = [];
var arrBotProcessNameBackup = [];

var botNum = 0;

// Validate bot by IG account detail and proxy.
BotController.validateBot = function(req, res) {
    var botName = req.body.botName,
        accountName = req.body.accountName,
        accountPass = req.body.accountPassword,
        proxyUrl = req.body.proxyUrl;

    if(proxyUrl == '') {
        BotService.getProxy(function(response) {
            if(response && response.flag == true) {
                var proxyId = response.data.id;
                var autoProxyUrl = 'http://' + response.data.url;
                var proxyState = response.data.state;
                
                BotService.validateBot(accountName, accountPass, autoProxyUrl, function(response) {
                    if(response.flag == false) {
                        switch(cb.type) {
                            case 'CheckpointError':
                                res.json({
                                    flag: false,
                                    message: 'You need to login your user'
                                });
            
                                break;
                            case 'AuthenticationError':
                                res.json({
                                    flag: false,
                                    message: 'Authentication Error, Please retype your user detail.'
                                });
                                
                                break;
                            case 'CreateError':
                                res.json({
                                    flag: false,
                                    message: 'Creating Session Error.'
                                });
            
                                break;
                        }
                    } else {
                        if(req.session.user.userId > 0) {
                            var newBotData = {
                                user_id: req.session.user.userId,
                                bot_name: botName,
                                account_name: accountName,
                                account_password: accountPass,
                                account_image_url: response.imageUrl,
                                state: 0
                            }

                            var proxyData = {
                                isManual: false,
                                id: proxyId,
                                url: autoProxyUrl,
                                state: proxyState
                            }

                            BotService.saveBotDetail(newBotData, proxyData, function(response) {
                                 res.json(response);
                            });
                        } else {
                            
                        }
                    }
                });
            } else {
                 res.json(response);
            }
        })
    } else {
        BotService.validateBot(accountName, accountPass, proxyUrl, function(response) {
            if(response.flag == false) {
                switch(cb.type) {
                    case 'CheckpointError':
                        res.json({
                            flag: false,
                            message: 'You need to login your user'
                        });
    
                        break;
                    case 'AuthenticationError':
                        res.json({
                            flag: false,
                            message: 'Authentication Error, Please retype your user detail.'
                        });
                        
                        break;
                    case 'CreateError':
                        res.json({
                            flag: false,
                            message: 'Creating Session Error.'
                        });
    
                        break;
                }
            } else {
                if(req.session.user.userId > 0) {
                    var newBotData = {
                        user_id: req.session.user.userId,
                        bot_name: botName,
                        account_name: accountName,
                        account_password: accountPass,
                        account_image_url: response.imageUrl,
                        state: 0
                    }

                    var proxyData = {
                        isManual: true,
                        url: proxyUrl
                    }

                    BotService.saveBotDetail(newBotData, proxyData, function(response) {
                         res.json(response);
                    });
                } else {
                    res.json({
                        flag: false,
                        message: 'Server connection error!'
                    });
                }
            }
        });
    }

   
}

// Save filters by array to rows.
BotController.saveFilters = function(req, res) {
    BotService.saveFilters(req.body, function(response) {
        res.json(response);
    });
}

// Save comment by row
BotController.saveComment = function(req, res) {
    BotService.saveComment(req.body, function(response) {
        res.json(response);
    });
}

// Save reply list by row
BotController.saveReply = function(req, res) {
    BotService.saveReply(req.body, function(response) {
        res.json(response);
    });
}

// save follow up message by bulk insert
BotController.saveFUMessage = function(req, res) {
    var botId = req.body.botId,
        arrData = req.body.data;

    var arrFUMData = [];

    for(var obj of arrData) {
        var startDate = (new Date()).getTime();
        var deltaDate = obj.day * 86400000;

        arrFUMData.push({
            bot_id: botId,
            start_date: new Date(startDate + deltaDate).toISOString(),
            text: obj.message,
            state: 1
        });
    }
    

    BotService.saveFUMessage(arrFUMData, function(response) {
        res.json(response);
        arrFUMData = [];
    });

}

// Save bot setting by json
BotController.saveSettings = function(req, res) {
    BotService.saveSetting(req.body, function(response) {
        res.json(response);
    });  
}

// Create bot by bot details
BotController.createNewBot = function(req, res) {
    BotService.getBotProperties(req.body.botId, function(response) {
        // console.log(response);
        arrBotProcess.push(fork(path.join(__dirname, 'newBotProcess.js')));
        arrBotProcessName.push(req.body.botId);

        arrBotProcess[botNum].on('message', function(data) {
            if(data == 1) {
                BotService.updateBotState(req.body.botId, function(cb) {
                    if(cb.flag == true) {
                        botNum = botNum + 1;
                        res.json(cb);
                    } else {
                        res.json(cb);
                    };
                });
            }
        });

        arrBotProcess[botNum].send(response);
    });
}

// Export module with UserController.
module.exports = BotController;