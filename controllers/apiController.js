/**
 * api controller.
 * apiController.js
 * 
 * created by super-sean
 * version 1.1.1
 */
'use strict';

// Import npm modules.
const jwt = require('jsonwebtoken');
const passport = require('passport');

// Import project sub modules.
require('../services/passport')(passport);
const UserModel = require('../models').User;

// Define authentication controller.
var ApiController = {};

ApiController.signup = function(req, res) {
    if(!req.body.email || !req.body.password || !req.body.code) {
        res.status(400).json({
            flag: false,
            message: 'Please, fill in all the fields.'
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
                console.log(user);
            })
            .catch(function(error) {
                console.log('Create new user error: ' + error);
            });
    }
}

ApiController.login = function(req, res) {
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
                var token = jwt.sign(JSON.parse(JSON.stringify(user.dataValues)), 'nodeauthsecret', {expiresIn: 86400 * 30});
                
                jwt.verify(token, 'nodeauthsecret', function(err, data) {
                    //console.log(err, data);
                });

                res.status(200).json({
                    flag: true,
                    token: 'JWT ' + token,
                    message: 'Authentication successed!'
                });

            } else {
                res.status(401).json({
                    flag: false,
                    message: 'Authentication failed. Wrong password.'
                });
            }            
        });
    }).catch(function(error) {
        console.log('Find user error: ' + error);
    })
}

function getToken(headers) {
    if (headers && headers.authorization) {
      var parted = headers.authorization.split(' ');
      if (parted.length === 2) {
        return parted[1];
      } else {
        return null;
      }
    } else {
      return null;
    }
};

// Export module with ApiController.
module.exports = ApiController;