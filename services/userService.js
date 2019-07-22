/**
 * @description Proxy Service library.
 * @name userService.js
 * @version 2.1.2
 * @author Super-Sean1995
 */

'use strict';

// Import Data Models.
var UserModel = require('../models').User;

// Definition Bot Service module.
var UserService = {};

UserService.getUserDetail = getUserDetail;
UserService.getAllUsers = getAllUsers;

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
    UserModel.findAll()
        .then(function (users) {
            cb(users);
        })
        .catch(function (error) {
            console.log(error);
        });
}
// Export BotService module.
module.exports = UserService;