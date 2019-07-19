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

// Export BotService module.
module.exports = UserService;