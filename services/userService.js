/**
 * @description Proxy Service library.
 * @name userService.js
 * @version 2.1.2
 * @author Super-Sean1995
 */

'use strict';
// Import npm modules
var path = require('path'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    Sequelize = require('sequelize');


// Import Data Models.
var UserModel = require('../models').User;
var BotModel = require('../models').Bot;
// var sequelize = new Sequelize('postgres://postgres:Rango941001top@@@@localhost:5432/instagram_dev');
var sequelize = new Sequelize('postgres://postgres:Rango941001top@@@@149.28.82.166:5432/instagram_dev');

// Definition Bot Service module.
var UserService = {};

UserService.getUserDetail = getUserDetail;
UserService.getAllUsers = getAllUsers;
UserService.updateUserByAdmin = updateUserByAdmin;
UserService.deleteUserByAdmin = deleteUserByAdmin;
UserService.createNewUserByAdmin = createNewUserByAdmin;
UserService.getAllUsersDetail = getAllUsersDetail;
UserService.getAllBotByUserIdForAdmin = getAllBotByUserIdForAdmin;

/**
 * @description
 * Get user detail by user id
 * 
 * @param {INTEGER} id 
 * @param {OBJECT} cb 
 */
function getUserDetail(id, cb) {
    UserModel.findOne({
        where: {
            id: id
        }
    }).then(function(user) {
        cb(user.dataValues)
    })
}

/**
 * @description
 * get all users to manage for admin
 * 
 * @param {OBJECT} cb 
 */
function getAllUsers(cb) {
    var selectQuery = ` SELECT
                            A.id,
                            A.first_name,
                            A.last_name,
                            A.email,
                            A.user_name,
                            A.password,
                            A.bill_token,
                            B.name,
                            A.state,
                            A."createdAt",
                            A."updatedAt"
                        FROM
                            "public"."Users" AS A,
                            "public"."Roles" AS B
                        WHERE
                            A.role = B.id
                            AND A.state = 1`;

    sequelize.query(selectQuery, {
        type: sequelize.QueryTypes.SELECT
    }).then(function(result) {

        cb(result);
    }).catch(function(error) {
        console.log('Get all bots detail error:' + error);
    })
}

/**
 * @description
 * update user by admin
 * 
 * @param {OBJECT} data 
 * @param {OBJECT} cb 
 */
function updateUserByAdmin(data, cb) {
    var updateData = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        role: data.role
    }

    UserModel.update(updateData, {
        where: {
            id: data.userId
        }
    }).then(function () {
        cb({
            flag: true,
            message: 'User had been updated'
        })
    }).catch(function (error) {
        cb({
            flag: false,
            message: 'Failed the update the user' 
        })
    })
}

/**
 * @description
 * delete user by amdin
 * 
 * @param {OBJECT} data 
 * @param {OBJECT} cb 
 */
function deleteUserByAdmin(data, cb) {
    console.log(data);
    var deleteData = {
        state: 0
    }

    UserModel.update(deleteData, {
        where: {
            id: data.userId
        }
    }).then(function() {
        cb({
            flag: true,
            message: 'User had been deleted'
        })
    }).catch(function (error) {
        cb({
            flag: false,
            message: 'Failed the delete the user' 
        })
    });
}

/**
 * @description
 * create user by admin manually.
 * 
 * @param {OBJECT} data 
 * @param {OBJECT} cb 
 */
function createNewUserByAdmin(data, cb) {
    UserModel.findAndCountAll({
        where: {
            email: data.email
        }
    }).then(function(result) {
        if(result.count > 0) {
            cb({
                flag: false,
                message: 'This email already exist.'
            })
        } else {
            var newUserData = {
                first_name: data.firstName,
                last_name: data.lastName,
                email: data.email,
                user_name: data.userName,
                password: data.password,
                role: data.role,
                state: 1
            }

            UserModel.create(newUserData)
                .then(function() {
                    cb({
                        flag: true,
                        message: 'Created new user.'
                    })
                })
                .catch(function(error) {
                    cb({
                        flag: false,
                        message: 'Failed create new user.'
                    })
                });
        }
    }).catch(function(error) {
        cb({
            flag: false,
            message: 'Failed create new user.'
        })
    });
}

/**
 * @description
 * get all users situation by admin
 * 
 * @param {OBJECT} cb 
 */
function getAllUsersDetail(cb) {
    var userList = [];
    var selectQuery = ` SELECT 'bot_count' AS type,	A.id, A.user_name, COUNT(B.id) FROM "public"."Users" AS A, "public"."Bots" AS B WHERE A.id = B.user_id GROUP BY	A.id, A.user_name 
                        UNION ALL	
                        SELECT 'proxy_count' AS type, A.id, A.user_name, COUNT(C.id) FROM "public"."Users" AS A, "public"."Bots" AS B, "public"."ProxyUsageHistories" AS C WHERE A.id = B.user_id AND B.id = C.bot_id GROUP BY A.id, A.user_name 
                        UNION ALL
                        SELECT 'dialog_count' AS type, AA.user_id, BB.user_name, SUM(cnt) FROM (SELECT B.user_id, A.client_id, COUNT(distinct A.client_id) AS cnt FROM "public"."ReplyHistories" AS A, "public"."Bots" AS B WHERE A.bot_id = B.id GROUP BY 	B.id, B.user_id, A.client_id ORDER BY B.user_id, A.client_id) AS AA, "public"."Users" AS BB WHERE AA.user_id = BB.id GROUP BY AA.user_id, BB.user_name 
                        UNION ALL
                        SELECT 'comment_count' AS type, AA.user_id, BB.user_name, SUM(cnt) FROM (SELECT B.user_id, A.media_id, COUNT(distinct A.media_id) AS cnt FROM "public"."CommentHistories" AS A, "public"."Bots" AS B WHERE A.bot_id = B.id GROUP BY B.id, B.user_id, A.media_id ORDER BY B.user_id, A.media_id) AS AA, "public"."Users" AS BB WHERE AA.user_id = BB.id GROUP BY AA.user_id, BB.user_name 
                        UNION ALL
                        SELECT 'follow_count' AS type, AA.user_id, BB.user_name, SUM(cnt) FROM (SELECT B.user_id, A.client_id, COUNT(distinct A.client_id) AS cnt FROM "public"."FollowHistories" AS A, "public"."Bots" AS B WHERE A.bot_id = B.id GROUP BY B.id, B.user_id, A.client_id ORDER BY B.user_id, A.client_id) AS AA, "public"."Users" AS BB WHERE AA.user_id = BB.id GROUP BY AA.user_id, BB.user_name 
                        UNION ALL
                        SELECT 'like_count' AS type, AA.user_id, BB.user_name, SUM(cnt) FROM (SELECT B.user_id,	A.media_id,	COUNT(distinct A.media_id) AS cnt FROM	"public"."LikeHistories" AS A, "public"."Bots" AS B	WHERE A.bot_id = B.id GROUP BY		B.id, B.user_id, A.media_id	ORDER BY B.user_id,	A.media_id) AS AA, "public"."Users" AS BB WHERE AA.user_id = BB.id GROUP BY AA.user_id, BB.user_name`;
   
    UserModel.findAll({
        attributes: [
            'id', 'user_name'
        ],
        where: {
            state: 1
        }
    }).then(function(users) {
        for(var obj of users) {
            userList.push(obj.dataValues);
        }

        sequelize.query(selectQuery, {
            type: sequelize.QueryTypes.SELECT
        }).then(function(result) {
            cb({
                userList: userList,
                data: result
            });

            userList = [];
        }).catch(function(error) {
            console.log('Get all bots detail error:' + error);
        })
    }).catch(function(error) {
        console.log('Get user list error' + error)
    });
}

/**
 * @description
 * get all bot by id for admin.
 * 
 * @param {INTEGER} id 
 * @param {OBJECT} cb 
 */
function getAllBotByUserIdForAdmin(id, cb) {
    BotModel.findAll({
        attributes: [
            'id', 'bot_name','state', 'is_activated'
        ],
        where: {
            user_id: id
        }
    }).then(function (bots) {
        var arrBots = [];

        for(var obj of bots) {
            arrBots.push(obj.dataValues)
        }
        
        cb({
            flag: true,
            data: arrBots
        });

        arrBots = [];
    }).catch(function(error) {
        cb({
            flag: false,
            data: error
        });
    });
}
// Export BotService module.
module.exports = UserService;