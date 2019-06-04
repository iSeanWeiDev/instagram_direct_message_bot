/**
 * @description Bot Controller library.
 * @name botController.js
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

// Export BotController.
module.exports = BoardController;