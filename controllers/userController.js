/**
 * user controller.
 * userController.js
 * 
 * created by super-sean
 * version 1.1.1
 */
'use strict';

// Import npm modules.

// Import project sub modules.
const UserModel = require('../models').User;

// Define user controller.
var UserController = {};

UserController.signup = function(req, res) {
    if(!req.body.email || !req.body.password || !req.body.code) {
        res.status(400).json({
            flag: false,
            message: 'Please, fill in all the fields.'
        });
    } else {
        if (req.body.code != 5826) {
            res.json({
                flag: false,
                message: 'Invalid code.'
            });
        } else {
            UserModel.findAndCountAll({
                where: {
                    email: req.body.email
                }
            }).then(function(result) {
                if(result.count > 0) {
                     res.json({
                        flag: false,
                        message: 'Duplicated email'
                     });
                } else {
                    var newUser = {
                        username: req.body.email.split('@')[0],
                        firstname: req.body.firstName,
                        lastname: req.body.lastName,
                        email: req.body.email,
                        password: req.body.password,
                        code: req.body.code,
                        status: 1
                    }

                    UserModel.create(newUser)
                        .then(function(user) {
                            if(user) {
                                res.status(200).json({
                                    flag: true,
                                    message: 'Successfully created your account.'
                                });
                            } else {
                                res.status(404).json({
                                    flag: false,
                                    message: 'Invalidated your details.'
                                });
                            }
                        })
                        .catch(function(error) {
                            console.log('Create new user error: ' + error);
                        });
                }
            }).catch(function(error) {
                res.json({
                    flag: false,
                    message: 'Email validation error' + error
                })
            })
        }
    }
}

UserController.login = function(req, res) {
    UserModel.findOne({
        where: {
            username: req.body.userName.split('@')[0]
        }
    }).then(function(user) {
        if(!user) {
            return res.status(401).json({
                flag: false,
                message: 'Authentication failed. User not found.',
            });
        }

        user.comparePassword(req.body.password, (err, isMatch) => {
            if(isMatch && !err) {
                req.session.user = {
                    id: user.dataValues.id,
                    username: user.dataValues.username,
                    firstName: user.dataValues.firstname,
                    lastName: user.dataValues.lastname
                };
                
                req.session.authenticated = true;
                res.status(200).json({
                    flag: true,
                    message: 'Welcome to meta medias!'
                });
            } else {
                res.json({
                    flag: false,
                    message: 'Authentication failed. Wrong password.'
                });
            }            
        });
    }).catch(function(error) {
        res.json({
            flag: false,
            message: 'Find user error: ' + error
        });
    })
}

// Export module with UserController.
module.exports = UserController;