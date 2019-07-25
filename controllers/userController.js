/**
 * @description User Controller library.
 * @name userController.js
 * @version 2.1.2
 * @author Super-Sean1995
 */
'use strict';

// Import project sub modules.
const UserModel = require('../models').User;
var UserService = require('../services/userService');

// Define user controller.
var UserController = {}; 

// Register user by user email.
UserController.signup = function(req, res) {
    if(req.body.billToken == 'PRIVATED_TOKEN_FOR_TESTING') {
        UserModel.findAll({
            where: {
                email: req.body.email
            }
        }).then(function(users) {
            if(users.length == 0) {
                var newUser = {
                    first_name: req.body.firstName,
                    last_name: req.body.lastName,
                    email: req.body.email,
                    user_name: req.body.userName,
                    password: req.body.password,
                    bill_token: req.body.billToken,
                    role: 1,
                    state: 1
                }
    
                UserModel.create(newUser)
                    .then(function(user) {
                        res.status(200).json({
                            flag: true,
                            isToken: true,
                            message: 'Successfully created your account.'
                        });
                    })
                    .catch(function(error) {
                        console.log('Create user error: ' + error);
    
                        res.json({
                            flag: false,
                            isToken: true,
                            message: 'Server connection error, Try again.'
                        });
                    });
            } else {
                res.json({
                    flag: false,
                    isToken: true,
                    message: ' This email already used by another user.'
                });
            }
        }).catch(function(error) {
            console.log('Get user data for Auth error: ' + error);
    
            res.json({
                flag: false,
                isToken: true,
                message: 'Server connection error, Try again.'
            });
        });
    } else {
        res.json({
            flag: false,
            isToken: false
        })
    }
}

// Authenticate the user by email and create the session.
UserController.login = function(req, res) {
    UserModel.findOne({
        where: {
            email: req.body.email
        }
    }).then(function(user) {
        if(!user) {
            return res.json({
                flag: false,
                message: 'Authenication failure, User not found.'
            });
        }
        
        user.comparePassword(req.body.password, function(error, isMatch) {
            if(isMatch && !error) {
                req.session.user = {
                    userId: user.dataValues.id,
                    firstName: user.dataValues.first_name,
                    lastName: user.dataValues.last_name,
                    email: user.dataValues.email,
                    userName: user.dataValues.user_name,
                    role: user.dataValues.role
                };

                req.session.authenticated = true;

                res.json({
                    flag: true,
                    message: 'Welcome to Metamedias.co!'
                })
            } else {
                res.json({
                    flag: false,
                    message: 'Invalid credential!'
                })
            }
        });
        
    }).catch(function(error) {
        console.log('Get user data for authentication error: ' + error);

        res.json({
            flag: false,
            message: 'Server connection error'
        });
    });
}

// save user
UserController.saveUser = function(req, res) {
    UserService.updateUserByAdmin(req.body, function (cb) {
        if(cb.flag == true) {
             res.json(cb);
        } else {
             res.json(cb);
        }
    })
}

// delete user by admin
UserController.deleteUser = function(req, res) {
    UserService.deleteUserByAdmin(req.body, function (cb) {
        res.json(cb);
    });
}

// Create user by admin
UserController.createUser = function(req, res) {
    UserService.createNewUserByAdmin(req.body, function (cb) {
        res.json(cb);
    });
}

// get all bot by user id for admin
UserController.getAllBotByUserId = function (req, res) {
    UserService.getAllBotByUserIdForAdmin(req.body.id, function (cb) {
         res.json(cb);
    });
}

// save profile by user id
UserController.saveProfilebyId = function(req, res) {
    console.log(req.body);
}



// Export module with UserController.
module.exports = UserController;