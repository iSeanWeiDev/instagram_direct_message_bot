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
// var sequelize = new Sequelize('postgres://postgres:Rango941001top@@@@localhost:5432/instagram_dev');
var sequelize = new Sequelize('postgres://postgres:Rango941001top@@@@149.28.82.166:5432/instagram_dev');

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
                            A.role = B.id`;

    sequelize.query(selectQuery, {
        type: sequelize.QueryTypes.SELECT
    }).then(function(result) {

        cb(result);
    }).catch(function(error) {
        console.log('Get all bots detail error:' + error);
    })
}
// Export BotService module.
module.exports = UserService;