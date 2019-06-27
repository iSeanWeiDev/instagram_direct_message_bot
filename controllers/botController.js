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
                
                BotService.validateBot(accountName, accountPass, autoProxyUrl, function(cb) {
                    if(cb.flag == false) {
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
                                account_image_url: cb.imageUrl,
                                state: 0
                            }

                            var proxyData = {
                                isManual: false,
                                id: proxyId,
                                url: autoProxyUrl,
                                state: proxyState
                            }

                            BotService.saveBotDetail(newBotData, proxyData, function(saveCB) {
                                 res.json(saveCB);
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

// Delete bot by id
BotController.deleteBot = function(req, res) {
    if(req.body.botId) {
        for(var i = 0; i < arrBotProcessName.length; i++) {    
            if(arrBotProcessName[i] == req.body.botId) {
                arrBotProcess[i].kill();
                arrBotProcessName[i] = "###";
            }
        }

        /**
         * 1. loop for bot list and pop empty bot
         * 
         */
        arrBotProcessBackup = [];
        arrBotProcessNameBackup = [];

        for(var kk = 0; kk < arrBotProcessName.length; kk++)
        {
            if(arrBotProcessName[kk] != "###")
            {
                arrBotProcessBackup.push(arrBotProcess[kk]);
                arrBotProcessNameBackup.push(arrBotProcessName[kk]);
            }                            
        }
        
        /**
         * initialize and copy original thread array for bots with backup arraylist
         */
        arrBotProcess = [];
        arrBotProcessName = [];

        arrBotProcess = arrBotProcessBackup.slice(0);
        arrBotProcessName = arrBotProcessNameBackup.slice(0);

        BotService.deleteBotById(req.body, function(cb) {
            res.json(cb);
        });
    }
}

// get load more details for bot.
BotController.getLoadMoreDetails = function(req, res) {
    var userId = req.body.userId,
        botId = req.body.botId;
        
    BotService.getLoadMore(userId, botId, function(cb) {
        res.json(cb);
    });
}

// get message history by id
BotController.getMessageHistory = function(req, res) {
    var userId = req.session.user.userId;
    var botId = req.body.botId;
    var clientId = req.body.clientId;

    BotService.getMessageHistoryById(userId, botId, clientId, function(result) {
        res.json({
            flag: true,
            data: result
        });
    });
}

// Get dashboard init data
BotController.getDashboardInitData = function(req, res) {
    var state = parseInt(req.body.state);
    var userId = req.session.user.userId;

    BotService.getDashboardHistory(state, userId, function(result) {
        res.json({
            flag: true,
            data: result
        });
    });
}

// Send message to client with client id.
BotController.sendMessage = function(req, res) {
    BotService.getBotGeneralDetail(req.body, function(cb) {
        var name = cb.accountName;
        var password = cb.accountPass;
        var proxy = cb.proxyUrl;
        
        BotService.validateBot(name, password, proxy, function(validateCB) {
            if(validateCB.flag == true) {
                BotService.directMessageToClient(validateCB.session, req.body.clientId, req.body.message, function(dmCB) {
                    var saveData = {
                        bot_id: req.body.botId,
                        client_id: req.body.clientId,
                        client_name: dmCB.name,
                        client_image_url: dmCB.imgUrl,
                        client_text:  null,
                        is_manual: 'Y',
                        manual_reply_text: req.body.message,
                        reply_id: null
                    }

                    BotService.saveReplyHistory(saveData, function(response) {
                         res.json({
                             flag: true,
                             data: req.body.message
                         });
                    })
                });
            }
        });
    });
}

// change bot status
BotController.changeBotStatus = function(req, res) {
    if(req.body.status == 0) {
        if(req.body.botId) {
            for(var i = 0; i < arrBotProcessName.length; i++) {    
                if(arrBotProcessName[i] == req.body.botId) {
                    arrBotProcess[i].send({
                        flag: false
                    });

                    res.json({
                        flag: true,
                        message: 'Successfully paused your bot!'
                    });
                }
            }
        }
    } else {
        if(req.body.botId) {
            console.log(arrBotProcessName);
            BotService.getBotProperties(req.body.botId, function(response) {
                for(var i = 0; i < arrBotProcessName.length; i++) {    
                    if(arrBotProcessName[i] == req.body.botId) {
                        arrBotProcess[i].send(response);
                        res.json({
                            flag: true,
                            message: 'Successfully started your bot!'
                        });
                    }
                }
            });
        }
    }
}

// Export module with UserController.
module.exports = BotController;