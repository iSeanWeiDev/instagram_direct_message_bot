/**
 * @description Bot Service library.
 * @name botService.js
 * @version 2.1.2
 * @author Super-Sean1995
 */
'use strict';
// Import npm modules.

// Import project sub modules.
const UserModel = require('../models').User;
const ChallengeModel = require('../models').Challenge;
const ChallengeHistoryModel = require('../models').ChallengeHistory;

// Definition Bot Service module.
var UserService = {};

UserService.getInitialNotifications = getInitialNotifications;

/**
 * 
 * @param {INTEGER} userId 
 * @param {OBJECT} cb 
 */
function getInitialNotifications(userId, cb) {
    ChallengeModel.findAll({
        attributes: [
            'id', 'type', 'data', 'message'
        ],
        include: [{
            model: ChallengeHistoryModel,
            as: 'ChallengeHistories',
            attributes: [
                'bot_id', 'bot_name'
            ],
            where: {
                user_id: userId
            },
            order: [
                'updatedAt', 'DESC'
            ]
        }],
        where: {
            state: 1
        }
    }).then(function(histories) {
        cb({
            flag: true,
            data: histories
        })
    }).catch(function(error){
        cb({
            flag: false
        });

        console.log('Get notifiaction error: ' + error);
    });
}

// Export BotService module.
module.exports = UserService;
