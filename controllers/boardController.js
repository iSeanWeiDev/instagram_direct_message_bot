/**
 * @description Dashboard Controller library.
 * @name boardController.js
 * @version 1.1.2
 * @author Super-Sean1995
 */
'use strict';

var BoardService = require('../services/dashBoardService');
var BotService = require('../services/botService');
var BotModel = require('../models').Bot;
var Client = require('instagram-private-api').V1;

// Define Bot controller.
var BoardController = {};

BoardController.init = function(req, res) {
    var state = parseInt(req.body.state);
    var userId = req.session.user.id;

    BoardService.getHistories(state, userId, function(result) {
        res.status(201).json({
            flag: true,
            data: result
        });
    });

}

/**
 * @description
 * Get Message History controller function
 * 
 * @param {OBJECT} req
 * @param {OBJECT} res
 */
BoardController.getMessageHistory = function(req, res) {
    var userId = req.session.user.id;
    var botId = req.body.botId;
    var clientId = req.body.clientId;

    BoardService.getMessageHistoryById(userId, botId, clientId, function(result) {
        res.status(201).json({
            flag: true,
            data: result
        });
    });  
}

/**
 * @description
 * Send message to client with client id.
 * 
 * @param {OBJECT} req
 * @param {OBJECT} res
 */
BoardController.sendMessage = function(req, res) {
    var botId = req.body.botId,
        clientId = req.body.clientId,
        message = req.body.message;

    BotModel.findOne({
        where: {
            id: botId
        }
    }).then(function(bot) {
        console.log(bot);
        var name = bot.dataValues.accountname,
            password = bot.dataValues.password;

        BotService.validateBot(name, password, function(cb) {
            if(cb.flag == true) {
                var session = cb.session;

                BotService.directMessageToClient(session, clientId, message, function(result) {
                    console.log(result);
                    var saveData = {
                        botId: botId,
                        clientid: result.id,
                        clientname: result.name,
                        image: result.image,
                        
                    }

                    BotService.saveReplyHistory(saveData, function(response) {
                        console.log(response);
                    })
                }); 
            }
        });
    }).catch(function(error) {
        console.log('Get Bot Detail error: ' + error);
    });
}
// Export BotController.
module.exports = BoardController;