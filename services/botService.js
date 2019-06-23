/**
 * @description Bot Service library.
 * @name botService.js
 * @version 1.1.2
 * @author Super-Sean1995
 */

'use strict';
// Import npm modules.
var Client = require('instagram-private-api').V1,
    path = require('path'),
    _ = require('lodash'),
    Promise = require('bluebird');

// Definition Bot Service module.
var BotService = {};

// Define BotService Sub Functions.
BotService.validateBot = validateBot;
BotService.getProxy = getProxy;

// Import Data Models
var ProxyModel = require('../models').Proxy;
var ProxyUsageHistoryModel = require('../models').ProxyUsageHistory;

/**
 * @description
 * Validate bot to create news with username and password using instagram api.
 * 
 * @param {STRING} name 
 * @param {STRING} password 
 * @param {STRING} proxy
 * @param {OBJECT} cb 
 */
function validateBot(name, password, proxy, cb) {
    var cookieFileURL = '../cookies/' + name + '.json',
        storage = new Client.CookieFileStorage(path.join(__dirname, cookieFileURL)),
        device = new Client.Device(name);

    Client.Session.create(device, storage, name, password, proxy)
        .then(async function(session) {
            if(!session) {
                cb({
                    flag: false,
                    type: 'CreateError'
                })
            } else {
                Client.Account.showProfile(session)
                    .then(function(result) {
                        cb({
                            flag: true,
                            type: 'Success',
                            session: session,
                            imageUrl: result.profile_pic_url
                        });
                       
                    }).catch(function(error) {
                        console.log('Fetch user picture error: ' + error);
                    });
            }
        })
        .catch(function(reject) {
            cb({
                flag: false,
                type: reject.name
            });
        });
}


function getProxy(cb) {
    ProxyUsageHistoryModel.findAndCountAll({
        where: {
            is_manual: 'N'
        },
        group: [
            'id',
            'proxy_id'
        ]
    }).then(function(result) {
        console.log(result);
        if(result.count.length == 0) {
            ProxyModel.findAndCountAll({
                where: {
                    state: '1'
                }
            }).then(function(result) {
                var randomIndex = getRandomInt(result.count);
                console.log(result.count);

                var objProxy = {
                    proxy_id: result.rows[randomIndex-1].id,
                    proxy_url: result.rows[randomIndex-1].url
                }

                cb(objProxy);

            }).catch(function(error) {
                console.log('Get Proxy error: ' + error);
            });
        } else {

        }
    }).catch(function(error) {
        console.log('Get Proxy counts and url error' + error);
        // cb({
        //     flag: false,
        //     data: error
        // });
    });
}

/**
 * @description
 * Return Random integer within max values.
 * 
 * @param {INTEGER} count 
 */
function getRandomInt(count) {
    return Math.floor(Math.random() * Math.floor(count) + 1) ;
}
// Export BotService module.
module.exports = BotService;