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
    Promise = require('bluebird'),
    Sequelize = require('sequelize');

var sequelize = new Sequelize('postgres://postgres:Rango941001top@@@@localhost:5432/instagram_dev');
var BotModel = require('../models').Bot;
var ReplyModel = require('../models').Reply;
var CommentModel = require('../models').Comment;
var RepliesHistoryModel = require('../models').RepliesHistory;
var CommentHistoryModel = require('../models').CommentHistory;

// Definition Bot Service module.
var BotService = {};

// Define BotService Sub Functions.
BotService.validateBot = validateBot;
BotService.getAllBot = getAllBot;
BotService.getLoadMore = getLoadMore;
BotService.getInboxById = getInboxById;
BotService.getMessageById = getMessageById;
BotService.getCountOfReplyHistoriesById = getCountOfReplyHistoriesById;
BotService.directMessageToClient = directMessageToClient;
BotService.saveReplyHistory = saveReplyHistory;
BotService.getMediaIdByHashTag = getMediaIdByHashTag;
BotService.getCommentByBotId = getCommentByBotId;
BotService.commitByMediaId = commitByMediaId;
BotService.saveCommentHistory = saveCommentHistory;

/**
 * @description
 * Validate bot to create news with username and password using instagram api.
 * 
 * @param {STRING} name 
 * @param {STRING} password 
 * @param {OBJECT} cb 
 */
function validateBot(name, password, cb) {
    var cookieFileURL = '../cookies/' + name + '.json',
        storage = new Client.CookieFileStorage(path.join(__dirname, cookieFileURL)),
        device = new Client.Device(name);

    Client.Session.create(device, storage, name, password)
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
                            image: result.profile_pic_url
                        });
                       
                    }).catch(function(error) {
                        console.log('Fetch user picture error: ' + error);
                    });
            }
        })
        .catch(function(reject) {
            console.log(reject);
            cb({
                flag: false,
                type: reject.name
            });
        });
}

/**
 * @description
 * Get live bot details when open the allbots page.
 * 
 * @param {NUMBER} userId 
 * @param {OBJECT} cb 
 */
function getAllBot(userId,  cb) {
    BotModel.findAndCountAll({
        where: {
            userid: userId.toString(),
            status: '1'
        }
    }).then(function(result) {
        cb({
            rows: result.rows,
            count: result.count
        })
    }).catch(function(error) {
        console.log('Get lived bot detail error: ' + error);
    });
};

/**
 * @description
 * Get Bot all Details by userId, and botid. 
 * 
 * @param {NUMBER} userId 
 * @param {NUMBER} botId 
 * @param {OBJECT} cb 
 */
function getLoadMore(userId, botId, cb) {
    var selectQuery = `SELECT  'comment' as type,
                            a.id as botid,
                            c.id as dataid,
                            a.filters as filters,
                            c.comment as data
                        FROM 
                            public."Bots" as a ,
                            public."Comments" as c
                        WHERE
                            a.id = c.botid and 
                            a.status = 1 and 
                            a.userid = ? and
                            a.id = ?

                        UNION ALL

                        SELECT  'reply',
                            a.id,
                            b.id ,
                            a.filters,
                            b.message
                        FROM 
                            public."Bots" as a ,
                            public."Replies" as b
                        WHERE
                            a.id = b.botid and
                            a.status = 1 and 
                            a.userid = ? and
                            a.id = ?`;
    sequelize.query(selectQuery, {
        replacements: [
            userId,
            botId,
            userId,
            botId
        ]
    }).then(function(result) {
        var arrComment = [];
        var arrReply = [];

        for(var obj of result[0]) {
            if(obj.type == 'comment') {
                arrComment.push({id: obj.dataid, data: obj.data});
            }

            if(obj.type == 'reply') {
                arrReply.push({id: obj.dataid, data: obj.data});
            }
        }
        
        var sendData = {
            botId: result[0][1].botid,
            comment: arrComment,
            reply: arrReply,
            filter: result[0][1].filters
        }
        
        cb(sendData);

        // Initialize array;
        arrComment = [];
        arrReply = [];
    }).catch(function(error) {
        console.log('Get LodMore Detail error: ' + error);
    });
}

/**
 * @description
 * Get inbox data by botid.
 * 
 * @param {OBJECT} session 
 * @param {OBJECT} cb 
 */
function getInboxById(session, cb) {
    var feed = new Client.Feed.Inbox(session);

    var pFeed = new Promise(function(resolve) {
        return resolve(feed.get());
    });

    pFeed.then(function(results) {
        var countResult = results.length;
        var accountId;
        var message = '';
        var clientId;
        var imgUrl = '';
        var arrSendData = [];

        async function getNewInbox() {
            countResult--;

            results[countResult].items.forEach(function(item) {
                message = item._params.text;
                accountId = item._params.userId;
            });

            results[countResult].accounts.forEach(function(account) {
                clientId = account.pk;
                imgUrl = account.profile_pic_url;
            });

            if(accountId == clientId && message != undefined) {
                var objSendData = {
                    message: message,
                    clientId: clientId
                }

                arrSendData.push(objSendData);
            }

            if(countResult > 0) {
                getNewInbox();
            }
        }
        getNewInbox();

        cb(arrSendData);

        arrSendData = [];
    });
}

/**
 * @description
 * Get Direct messages from database.
 * 
 * @param {INTEGER} botId 
 * @param {OBJECT} cb 
 */
function getMessageById(botId, cb) {
    ReplyModel.findAndCountAll({
        where: {
            botid: botId
        }
    }).then(function(result) {
        var sendData = {
            rows: result.rows,
            count: result.count
        }

        cb(sendData);
    }).catch(function(error) {
        console.log('Get Reply messages error: ' + error);
    });
}

/**
 * @description
 * Get Count of Reply histories by botid.
 * 
 * @param {INTEGER} botId 
 * @param {OBJECT} cb 
 */
function getCountOfReplyHistoriesById(botId, cb) {
    RepliesHistoryModel.findAndCountAll({
        where: {
            botid: botId
        }
    }).then(function(result) {
        cb(result.count);
    }).catch(function(error) {
        console.log('Get Count of Reply Histories by BotID error: ' + error);
    })
}

/**
 * 
 * @param {OBJECT} session 
 * @param {STRING} id 
 * @param {STRING} message 
 * @param {OBJECT} cb 
 */
function directMessageToClient(session, id, message, cb) {
    Client.Thread.configureText(session, id, message)
        .then(function(result) {
            var sendData = {
                id: result[0].accounts[0].id,
                name: result[0].accounts[0].username,
                imgUrl: result[0].accounts[0].profile_pic_url
            }

            cb(sendData);
        })
        .catch(function(error) {
            console.log('Direct Message Error: ' + error);
        });
}

/**
 * @description
 * Save all Reply history.
 * 
 * @param {OBJECT} data 
 * @param {OBJECT} cb 
 */
function saveReplyHistory(data, cb) {
    var newHistory = {
        botid: data.botId,
        clientid: data.clientId,
        clientname: data.clientName,
        image: data.imageUrl,
        message: data.message,
        replyid: data.replyId
    }

    RepliesHistoryModel.create(newHistory)
        .then(function(history) {
            if(history) {
                cb({
                    id: history.dataValues.id
                });
            }
        })
        .catch(function(error) {
            console.log('Create new history error: ' + error);
        });
}

/**
 * @description
 * Get media id by hashtag from api
 * 
 * @param {OBJECT} session 
 * @param {STRING} hashTag 
 * @param {OBJECT} cb 
 */
function getMediaIdByHashTag(session, hashTag, cb) {
    var arrMediaId = [];
    var feed = new Client.Feed.TaggedMedia(session, hashTag);

    var pFeed = new Promise(function(resolve) {
        return resolve(feed.get());
    });

    pFeed.then(function(results) {
        for(var obj of results) {
            arrMediaId.push(obj.caption.media_id);
        }

        cb(arrMediaId);

        arrMediaId = [];
    }).catch(function(error) {
        console.log('Get Media Id by hashTag error: ' + error);
    });
}

/**
 * @description
 * Get comment list by botid from table.
 * 
 * @param {INTEGER} botId 
 * @param {OBJECT} cb 
 */
function getCommentByBotId(botId, cb) {
    CommentModel.findAll({
        where: {
            botid: botId
        }
    }).then(function(comments) {
        var arrComment = [];
        for(var obj of comments) {
            arrComment.push({
                id: obj.dataValues.id,
                comment: obj.dataValues.comment
            });
        }

        cb(arrComment);

        arrComment = [];
    }).catch(function(error) {
        console.log('Get comment error: ' + error);
    });
}

/**
 * @description
 * Commit to post by media id
 * 
 * @param {OBJECT} session 
 * @param {INTEGER} id 
 * @param {STRING} comment 
 * @param {OBJECT} cb 
 */
function commitByMediaId(session, id, comment, cb) {
    Client.Comment.create(session, id, comment)
        .then(function(result) {
            cb(result);
        })
        .catch(function(error) {
            console.log('Commit to post by media id error: ' + error);
        });
}

/**
 * @description
 * Save comment history
 * 
 * @param {OBJECT} data 
 * @param {OBJECT} cb 
 */
function saveCommentHistory(data, cb){
    var newHistory = {
        botid: data.botId,
        hashtag: data.hashtag,
        mediaid: data.mediaId,
        commentid: data.commentId
    }

    CommentHistoryModel.create(newHistory)
        .then(function(result) {
            cb(result);
        })
        .catch(function(error) {
            console.log('Save comment history error: ' + error);
        });
}

// Export BotService module.
module.exports = BotService;