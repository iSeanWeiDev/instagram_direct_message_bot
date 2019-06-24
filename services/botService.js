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
BotService.saveFilters = saveFilters;
BotService.saveComment = saveComment;
BotService.saveReply = saveReply;
BotService.saveFUMessage = saveFUMessage;
BotService.saveSetting = saveSetting;

// Import Data Models
var ProxyModel = require('../models').Proxy;
var ProxyUsageHistoryModel = require('../models').ProxyUsageHistory;
var FilterModel =  require('../models').Filter;
var CommentModel = require('../models').Comment;
var ReplyModel = require('../models').Reply;
var FUMModel = require('../models').FollowUpMessage;
var BotModel = require('../models').Bot;

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

/**
 * @ignore SQL required.
 * @param {*} cb 
 */
function getProxy(cb) {

}

/**
 * @description
 * Save filters by row using Recursive call.
 * 
 * @param {OBJECT} data 
 * @param {OBJECT} cb 
 */
function saveFilters(data, cb) {
    var botId = data.botId,
        arrFilter = data.filters,
        countArrFilter = data.filters.length - 1;

    async function saveFilter() {
        var newFilterRow = {
            bot_id: botId,
            hashtag: arrFilter[countArrFilter],
            state: 1 
        }

        FilterModel.create(newFilterRow)
            .then(function(filter) {
                if(filter) {
                    countArrFilter--;
                }
            })
            .catch(function(error) {
                console.log('Save filter error: ' + error);
                cb({
                    flag: false,
                    message: 'Server connection error!' 
                })
            });

        if(countArrFilter >= 0) {
            // Recursive call.
            saveFilter();

        } else {
            cb({
                flag: true,
                message: 'All of filters saved!'
            });
        }
    }

    saveFilter();
}

/**
 * @description
 * save comment by row with bot id.
 * 
 * @param {OBJECT} data 
 * @param {OBJECT} cb 
 */
function saveComment(data, cb) {
    var botId = data.bodId,
        text = data.comment;

    var newCommentRow = {
        bot_id: botId,
        text: text,
        state: 1
    }

    CommentModel.create(newCommentRow)
        .then(function(comment) {
            if(comment) {
                cb({
                    flag: true,
                    text: comment.dataValues.text,
                    message: 'Saved your commnent'
                })
            }
        })
        .catch(function(error) {
            console.log('Save comment error: ' + error);

            cb({
                flag: false,
                message: 'Server connection error.'
            })
        });
}

/**
 * @description
 * save direct message by row with bot id
 * 
 * @param {OBJECT} data 
 * @param {OBJECT} cb 
 */
function saveReply(data, cb) {
    var botId = data.bodId,
        text = data.reply;

    var newReplyRow = {
        bot_id: botId,
        text: text,
        state:  1
    }

    ReplyModel.create(newReplyRow)
        .then(function(reply) {
            if(reply) {
                cb({
                    flag: true,
                    text: reply.dataValues.text,
                    message: 'Saved your Default Reply'
                })
            }
        })
        .catch(function(error) {
            console.log('Save reply error: ' + error);

            cb({
                flag: false,
                message: 'Server connection error.'
            });
        });
}

/**
 * @description
 * save follow up messages by start date
 * 
 * @param {ARRAY} data 
 * @param {OBJECT} cb 
 */
function saveFUMessage(data, cb) {
    FUMModel.bulkCreate(data)
        .then(function() {
            cb({
                flag: true,
                message: 'Correctly saved!'
            })
        })
        .catch(function(error) {
            console.log('Bulk insert Follow up message error: ' + error);
            cb({
                flag: false,
                message: 'Server connection error!'
            })
        });
}

/**
 * @description
 * Save bot settings
 * 
 * @param {OBJECT} data 
 * @param {OBJECT} cb 
 */
function saveSetting(data, cb) {
    var botId = data.botId,
        messageDelay = data.messageDelay,
        maxComment = data.amountComment;

    var updateBotData = {
        message_delay:  messageDelay,
        max_comment: maxComment
    }

    BotModel.update(updateBotData, {
        where: {
            id: botId
        }
    }).then(function(response) {
        if(response[0] == 1) {
            console.log()
        }

    }).catch(function(error) {
        console.log('Update bot setting error: ' + error);
        cb({
            flag: false,
            message: 'Save bot setting error!'
        })
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