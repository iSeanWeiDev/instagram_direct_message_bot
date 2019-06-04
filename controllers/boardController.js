/**
 * @description Dashboard Controller library.
 * @name boardController.js
 * @version 1.1.2
 * @author Super-Sean1995
 */
'use strict';

var BoardService = require('../services/dashBoardService');

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

// Export BotController.
module.exports = BoardController;