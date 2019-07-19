/**
 * @description User Controller library.
 * @name challengeController.js
 * @version 2.1.2
 * @author Super-Sean1995
 */
'use strict';

// Import Product modules
var ChallengeService = require('../services/challengeService');

// Define user controller.
var ChallengeController = {}; 

ChallengeController.getDropDownNotification = function(req, res) {
    var userId = req.body.userId;

    ChallengeService.getHeaderNotification(userId, function (cb) {
         res.json({
             flag: true,
             data: cb.data,
             count: cb.count
         });
    });
}

ChallengeController.readNotification = function(req, res) {
    var id = req.body.index;
    
    ChallengeService.updateChallengeHistory(id, function(cb) {
        if(cb.flag == true) {
             res.json({
                 flag: true,
                 id: cb.data
             });
        } else {
             res.json({
                 flag: false
             });
        }
    });
}

// Export module with UserController.
module.exports = ChallengeController;