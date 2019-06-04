/**
 * @description Bot Controller library.
 * @name botController.js
 * @version 1.1.2
 * @author Super-Sean1995
 */
'use strict';
// Import npm modules.
var fork = require('child_process').fork,
    path = require('path');

// Import project modules.
var BotService = require('../services/botService');
var BotModel = require('../models').Bot;
var CommentModel = require('../models').Comment;
var ReplyModel = require('../models').Reply;

// Define Bot controller.
var BotController = {};
var arrBotProcess = [];
var arrBotProcessName = [];
var arrBotProcessBackup = [];
var arrBotProcessNameBackup = [];

var botNum = 0;

/**
 * @description 
 * Validate Bot function before create new bot.
 * 
 * @param {OBJECT} req
 * @param {OBJECT} res
 */
BotController.validateBot = function(req, res) {
    BotService.validateBot(req.body.userName, req.body.password, function(cb) {
        if(cb.flag == false) {
            switch(cb.type) {
                case 'CheckpointError':
                    res.status(404).json({
                        flag: false,
                        message: 'You need to login your user'
                    });

                    break;
                case 'AuthenticationError':
                    res.status(404).json({
                        flag: false,
                        message: 'Authentication Error, Please retype your user detail.'
                    });
                    
                    break;
                case 'CreateError':
                    res.status(404).json({
                        flag: false,
                        message: 'Creating Session Error.'
                    });

                    break;
            }
        } else {
            var newBotData = {
                userid: req.session.user.id,
                botname: req.body.botName,
                accountname: req.body.userName,
                password: req.body.password,
                image: cb.image,
                delay: req.body.delay,
                status: 0
            }

            BotModel.create(newBotData)
                .then(function(bot) {
                    res.status(201).json({
                        flag: true,
                        message: 'Successfully created your bot!',
                        botId: bot.dataValues.id
                    });
                })
                .catch(function(error) {
                    console.log('Insert new bot error: ' + error);
                });
        }
    });
}

/**
 * @description 
 * Save filters to bot table.
 * 
 * @param {OBJECT} req
 * @param {OBJECT} res
 */
BotController.saveFilters = function(req, res) {
    console.log(req.body);
    var updateBotData = {
        filters: JSON.stringify(req.body.filters)
    }

    BotModel.update(updateBotData, {
        where: {
            id: req.body.botId
        }
    }).then(function(response) {
        if(response[0] == 1) {
            res.status(201).json({
                flag: true,
                message: 'Successfully updated your bot filters'
            });
        }
    }).catch(function(error) {
        console.log('Update bot filters error: ' + error);
    });
}

/**
 * @description 
 * Save Comments to commit the post with botId in comments table.
 * 
 * @param {OBJECT} req
 * @param {OBJECT} res
 */
BotController.addComment = function(req, res) {
    var newComment = {
        botid: req.body.botId,
        comment: req.body.comment
    }

    CommentModel.create(newComment)
        .then(function(comment) {
            res.status(201).json({
                flag: true,
                message: 'Added your comment!',
                comment: comment.dataValues.comment
            });
        })
        .catch(function(error) {
            console.log('Insert new comment error' + error);
        });
}

/**
 * @description 
 * Save Reply message to message the post with botId in Replies table.
 * 
 * @param {OBJECT} req
 * @param {OBJECT} res
 */
BotController.addMessage = function(req, res) {
    var newReply = {
        botid: req.body.botId,
        message: req.body.message
    }

    ReplyModel.create(newReply)
        .then(function(reply) {
            res.status(201).json({
                flag: true,
                message: 'Added your message!',
                reply: reply.dataValues.message
            });
        })
        .catch(function(error) {
            console.log('Insert new reply message error: ' + error);
        });
}

/**
 * @description 
 * Set max count of comments per daily of bot with botId in Bot table.
 * 
 * @param {OBJECT} req
 * @param {OBJECT} res
 */
BotController.setCountMaxComment = function(req, res) {
    var updateData = {
        max: parseInt(req.body.maxCommentDaily)
    }

    BotModel.update(updateData, {
        where: {
            id:  req.body.botId
        }
    }).then(function(response) {
        if(response[0] == 1) {
            res.status(201).json({
                flag: true,
                message: 'Set your max counts of comment per day!'
            });
        }
    }).catch(function(error) {
        console.log('Set max count of comments per daily of bot error ' + error);
    });
}

/**
 * @description 
 * Create new bot using botId.
 * 
 * @param {OBJECT} req
 * @param {OBJECT} res
 */
BotController.createNewBot = function(req, res) {
    if(!req.body.botId) {
        res.status(404).json({
            flag: false,
            message: 'Invalid create new bot. Try again!'
        });
    } else {
        BotModel.findOne({
            where: {
                id: req.body.botId
            }
        }).then(function(bot) {
            if(bot) {
                var sendData = {
                    botId: bot.dataValues.id,
                    name: bot.dataValues.accountname,
                    password: bot.dataValues.password,
                    delayTime: bot.dataValues.delay,
                    maxCommentDaily: bot.dataValues.max,
                    filters: bot.dataValues.filters
                }

                arrBotProcess.push(fork(path.join(__dirname, 'newBotProcess.js')));
                arrBotProcessName.push(bot.dataValues.id);

                arrBotProcess[botNum].on('message', function(data) {
                    if(data == 1) {
                        var updateData = {
                            status: 1
                        }

                        BotModel.update(updateData, {
                            where: {
                                id: bot.dataValues.id
                            }
                        }).then(function(response) {
                            if(response[0] == 1) {
                                botNum = botNum + 1;

                                res.status(201).json({
                                    flag: true,
                                    message: 'Successfully, created your bot!'
                                });
                            } else {
                                res.status(404).json({
                                    flag: false,
                                    message: 'Invalid create new bot. Try again!'
                                });
                            }
                        }).catch(function(error) {
                            console.log('Update bot status error: ' +  error);
                        });
                    }
                });

                arrBotProcess[botNum].send(sendData);

            } else {
                res.status(404).json({
                    flag: false,
                    message: 'Invalid create new bot. Try again!'
                });
            }

        }).catch(function(error) {
            console.log('Fetch bot detail error: ' + error);
        });
    }
}

/**
 * @description 
 * Get bot clear Details.
 * 
 * @param {OBJECT} req
 * @param {OBJECT} res
 */
BotController.getLoadMoreDetails = function(req, res) {
    var userId = req.body.userId,
        botId = req.body.botId;

    BotService.getLoadMore(userId, botId, function(cb) {
        res.status(201).json({
            flag: true,
            data: cb
        });
    });
}

/**
 * @description 
 * Delete bot by botId
 * 
 * @param {OBJECT} req
 * @param {OBJECT} res
 */
BotController.deleteBotById = function(req, res) {
    if(req.body.botId) {
        var updateBotData = {
            status: 0
        }
       
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

        BotModel.update(updateBotData, {
            where: {
                id: req.body.botId,
                userid: req.body.userId
            }
        }).then(function(response) {
            if(response[0] == 1) {
                res.status(201).json({
                    flag: true,
                    message:'Successfully deleted'
                });
            }
        }).catch(function(error) {
            console.log('Delete Bot Error: ' + error);
        });
    }
}

// Export BotController.
module.exports = BotController;