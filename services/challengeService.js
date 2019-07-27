/**
 * @description Bot Service library.
 * @name botService.js
 * @version 2.1.2
 * @author Super-Sean1995
 */
'use strict';
// Import npm modules.
var Sequelize = require('sequelize');

var sequelize = new Sequelize('postgres://postgres:Rango941001top@@@@localhost:5432/instagram_dev');
// var sequelize = new Sequelize('postgres://postgres:Rango941001top@@@@149.28.82.166:5432/instagram_dev');
var Op = Sequelize.Op;

// Import project sub modules.
const UserModel = require('../models').User;
const ChallengeModel = require('../models').Challenge;
const ChallengeHistoryModel = require('../models').ChallengeHistory;

// Definition Bot Service module.
var ChallengeService = {};

ChallengeService.getHeaderNotification = getHeaderNotification
ChallengeService.getInitialNotifications = getInitialNotifications;
ChallengeService.updateChallengeHistory = updateChallengeHistory;

/**
 * @description
 * get header bar notification.
 * 
 * @param {INTEGER} userId 
 * @param {OBJECT} cb 
 */
function getHeaderNotification(userId, cb) {
    var selectQuery = ` SELECT A.user_name, 
                            AA.account_name, 
                            C.data, 
                            C.message,
                            AA.bot_name, 
                            AA."createdAt"
                        FROM 
                            (SELECT B.account_name, 
                                D.bot_name, 
                                D.user_id,
                                D.challenge_id,
                                D."createdAt"
                            FROM
                                "public"."Bots" AS B RIGHT JOIN "public"."ChallengeHistories" AS D
                                ON B.id = D.bot_id
                                AND D.state = 1
                            ) AS AA,
                            "public"."Users" AS A,
                            "public"."Challenges" AS C
                        WHERE  
                            A.id = ?
                            AND  A.id = AA.user_id
                            AND  C.id = AA.challenge_id

                        ORDER BY
                            AA."createdAt" DESC
                        LIMIT 5 `;
    
    sequelize.query(selectQuery, {
        replacements: [
            userId
        ]
    }).then(function(result) {
        ChallengeHistoryModel.findAndCountAll({
            where: {
                user_id: userId,
                state: 1
            }
        }).then(function (params) {
            cb({
                data: result[0],
                count: params.count
            });
        })

    }).catch(function(error) {
        console.log('Get History count data error: ' + error);
    });
}

/**
 * @description
 * Initialize the datas for notification page.
 * 
 * @param {INTEGER} userId 
 * @param {OBJECT} cb 
 */
function getInitialNotifications(userId, cb) {
    var selectQuery =  `SELECT A.user_name, 
                            AA.account_name, 
                            C.data, 
                            C.message,
                            AA.user_id,
                            AA.challenge_id,
                            AA.bot_name, 
                            AA."createdAt"
                        FROM 
                            (SELECT B.account_name, 
                                D.bot_name, 
                                D.user_id,
                                D.challenge_id,
                                D."createdAt"
                            FROM
                                "public"."Bots" AS B RIGHT JOIN "public"."ChallengeHistories" AS D
                                ON B.id = D.bot_id
                                AND D.state = 1
                            ) AS AA,
                            "public"."Users" AS A,
                            "public"."Challenges" AS C
                        WHERE  
                            A.id = ?
                            AND  A.id = AA.user_id
                            AND  C.id = AA.challenge_id

                        ORDER BY
                            AA."createdAt" DESC`;
    sequelize.query(selectQuery, {
        replacements: [
            userId
        ]
    }).then(function (result) {
        cb({
            flag: true,
            data: result[0]
        })
    });
}

/**
 * @description
 * Update the challenge history
 * 
 * @param {INTEGER} id 
 * @param {OBJECT} cb 
 */
function updateChallengeHistory(id, cb) {
    var updateData = {
        state: 0
    }

    ChallengeHistoryModel.update(updateData, {
        where: {
            id: id
        }
    }).then(function(result) {
        cb({
            flag: true,
            data: id
        })
    }).catch(function(error) {
        cb({
            flag: false
        })
    });
}

// Export BotService module.
module.exports = ChallengeService;
