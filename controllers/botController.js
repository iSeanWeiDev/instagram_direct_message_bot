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
        BotService.getProxy(function(proxy) {
            BotService.validateBot(accountName, accountPass, proxy.url, function(response) {
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
                    var newBotData = {
                        user_id: req.session.user.userId,
                        bot_name: botName,
                        account_name: accountName,
                        account_password: accountPass,
                        account_image_url: response.imageUrl,
                        state: 0
                    }

                    BotModel.create(newBotData)
                        .then(function(bot) {
                            var newProxyUsageHistoryData = {
                                bot_id: bot.dataValues.id,
                                is_manual: 'N',
                                proxy_id: proxy.id,
                                proxy_url: proxy.url
                            }

                            newProxyUsageHistoryData.create(newProxyUsageHistoryData)
                                .then(function(history) {
                                    res.json({
                                        flag: true,
                                        message: 'Successfully created your bot!',
                                        botId: history.dataValues.bot_id
                                    });
                                })
                                .catch(function(error) {
                                    console.log('Save Proxy Usage History error: ' + error);
                                });
                        })
                        .catch(function(error) {
                            console.log('Create new bot error: ' + error);
                            res.json({
                                flag: false,
                                message: 'Server connection error!'
                            })
                        });
                }
            });
        });
    } else {
        BotService.validateBot(accountName, accountPass, proxyUrl, function(response) {
            if(response.flag == true) {

            } else {
                
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
    
    BotService.saveFUMessage(arrData, function(response) {
        req.json(response);
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

}

// Export module with UserController.
module.exports = BotController;