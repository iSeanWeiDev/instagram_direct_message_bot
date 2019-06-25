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

// Definition Bot Service module.
var BotService = {};

// Define BotService Sub Functions.
BotService.validateBot = validateBot;
BotService.saveBotDetail = saveBotDetail;
BotService.getProxy = getProxy;
BotService.saveFilters = saveFilters;
BotService.saveComment = saveComment;
BotService.saveReply = saveReply;
BotService.saveFUMessage = saveFUMessage;
BotService.saveSetting = saveSetting;
BotService.getBotProperties = getBotProperties;
BotService.updateBotState = updateBotState;
BotService.getMediaIdByHashTag= getMediaIdByHashTag;
BotService.followUserById = followUserById;
BotService.saveFollowUserHistory = saveFollowUserHistory;
BotService.commitByMediaId = commitByMediaId;
BotService.saveCommitHistory = saveCommitHistory;
BotService.getInboxById = getInboxById;
BotService.getCountOfReplyHistoriesById = getCountOfReplyHistoriesById;
BotService.directMessageToClient = directMessageToClient;
BotService.saveReplyHistory = saveReplyHistory;
BotService.getClientIdList = getClientIdList;
BotService.saveFUMHistory = saveFUMHistory;
BotService.getFollowerList = getFollowerList;
BotService.unFollowUserbyId = unFollowUserbyId;

// Import Data Models
var ProxyModel = require('../models').Proxy;
var ProxyUsageHistoryModel = require('../models').ProxyUsageHistory;
var FilterModel =  require('../models').Filter;
var CommentModel = require('../models').Comment;
var ReplyModel = require('../models').Reply;
var FUMModel = require('../models').FollowUpMessage;
var BotModel = require('../models').Bot;
var CommentHistoryModel = require('../models').CommentHistory;
var ReplyHistoryModel = require('../models').ReplyHistory;
var FollowUpMessageHistoryModel = require('../models').FollowUpMessageHistory;
var FollowHistoryModel = require('../models').FollowHistory;

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
 * @description
 * Save bot detail when it validated
 * 
 * @param {OBJECT} data 
 * @param {OBJECT} proxyData
 * @param {OBJECT} cb 
 */
function saveBotDetail(data, proxyData, cb) {
    BotModel.create(data)
        .then(function(bot) {
            if(proxyData.isManual == true) {
                var newProxyUsageHistoryData = {
                    bot_id: bot.dataValues.id,
                    is_manual: "Y",
                    proxy_id: null,
                    proxy_url: proxyData.url
                }

                ProxyUsageHistoryModel.create(newProxyUsageHistoryData)
                    .then(function(history) {
                        cb({
                            flag: true,
                            message: 'Successfully created your bot!',
                            botId: history.dataValues.bot_id
                        });
                    })
                    .catch(function(error) {
                        console.log('Save Proxy Usage History error: ' + error);

                        cb({
                            flag: false,
                            message: 'Server connection error'
                        });
                    });
            } else {
                var updateProxyData = {
                    state: proxyData.state + 1
                }

                ProxyModel.update(updateProxyData, {
                    where: {
                        id: proxyData.id
                    }
                }).then(function() {
                    var newProxyUsageHistoryData = {
                        bot_id: bot.dataValues.id,
                        is_manual: "N",
                        proxy_id: proxyData.id,
                        proxy_url: proxyData.url
                    }

                    ProxyUsageHistoryModel.create(newProxyUsageHistoryData)
                        .then(function(history) {
                            cb({
                                flag: true,
                                message: 'Successfully created your bot!',
                                botId: history.dataValues.bot_id
                            });
                        })
                        .catch(function(error) {
                            console.log('Save Proxy Usage History error: ' + error);

                            cb({
                                flag: false,
                                message: 'Server connection error'
                            });
                        });
                }).catch(function(error) {
                    console.log('Update proxy state error: ' + error);
    
                    cb({
                        flag: false,
                        message: 'Server connection error'
                    })
                });
            }
        })
        .catch(function(error) {
            console.log('Create new bot error: ' + error);

            res.json({
                flag: false,
                message: 'Server connection error!'
            });
        });
}

/**
 * @descriptin
 * If want to use our service proxy, then we need to service the proxy as user want.
 * 
 * @param {*} cb 
 */
function getProxy(cb) {
    var selectQuery = ` SELECT * FROM (
                            SELECT 
                                A.id, A.url, A.state
                            FROM
                                "public"."Proxies" AS A
                            WHERE
                                A.state < 4
                                AND A."expire_date" > DATE(now())
                        ) AA
                        LIMIT 1 `;

    sequelize.query(selectQuery)
        .then(function(result){
            cb({
                flag: true,
                data: result[0][0]
            })
        })
        .catch(function(error) {
            console.log('Get Proxy error:' + error);
            cb({
                flag: false,
                message: 'Server connection error'
            })
        });
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
        arrFilter = data.filters;

        
    var countArrFilter = data.filters.length;
    async function saveFilter() {
        countArrFilter--;

        var newFilterRow = {
            bot_id: botId,
            hashtag: arrFilter[countArrFilter],
            state: 1 
        }

        FilterModel.create(newFilterRow);

        if(countArrFilter > 0) {
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
    var botId = data.botId,
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
    var botId = data.botId,
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
            cb({
                flag: true,
                message: 'Setted your setting to your bot!'
            })
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
 * get bot properties by bot id.
 * 
 * @param {INTEGER} botId 
 * @param {OBJECT} cb 
 */
function getBotProperties(botId, cb) {
    var getData = new Promise(function(resolve) {
        var arrFilter = [],
            arrComment = [],
            arrReply = [],
            arrFUM = [];

        BotModel.findOne({
            where: {
                id: botId
            }
        }).then(function(bot) {
            ProxyUsageHistoryModel.findOne({
                attributes: ['id', 'proxy_url'],
                where: {
                    bot_id: botId
                }
            }).then(function(proxy) {
                FilterModel.findAll({
                    attributes: ['id','hashtag'],
                    where: {
                        bot_id: botId,
                        state: 1
                    }
                }).then(function(filters) {
                    for(var obj of filters) {
                        arrFilter.push(obj.dataValues);
                    }
        
                    CommentModel.findAll({
                        attributes: ['id', 'text'],
                        where: {
                            bot_id: botId,
                            state: 1
                        }
                    }).then(function(comments) {
                        for(var obj of comments) {
                            arrComment.push(obj.dataValues);
                        }
        
                        ReplyModel.findAll({
                            attributes: ['id', 'text'],
                            where: {
                                bot_id: botId,
                                state: 1
                            }
                        }).then(function(replies) {
                            for(var obj of replies) {
                                arrReply.push(obj.dataValues);
                            }
        
                            FUMModel.findAll({
                                attributes: ['id', 'start_date', 'text'],
                                where: {
                                    bot_id: botId,
                                    state: 1
                                }
                            }).then(function(fums) {
                                for(var obj of fums) {
                                    arrFUM.push(obj.dataValues);
                                }
        
                                var botData = {
                                    flag: true,
                                    bot: bot.dataValues,
                                    proxy: proxy.dataValues,
                                    filters: arrFilter,
                                    comments: arrComment,
                                    replies: arrReply,
                                    fums: arrFUM
                                }
                        
                                return resolve(botData);
        
                            }).catch(function(error) {
                                console.log('Get follow up message error:' + error);
                            });
                        }).catch(function(error) {
                            console.log('Get reply error: ' +  error);
                        });
                    }).catch(function(error) {
                        console.log('Get comment error: ' + error);
                    });
                }).catch(function(error) {
                    console.log('Get filters error: ' + error);
                });
            }).catch(function(error) {
                console.log('Get proxy error: ' + error);
            })
            
        }).catch(function(error) {
            console.log('Get bot detail error: ' + error);
        });
    });

    getData.then(function(data) {
        cb(data);
    })
}

/**
 * 
 * @param {INTEGER} botId 
 * @param {OBJECT} cb 
 */
function updateBotState(botId, cb) {
    var updateData = {
        status: 1
    }

    BotModel.update(updateData, {
        where: {
            id: botId
        }
    }).then(function(result) {
        if(result[0] == 1) {
            cb({
                flag: true,
                message: 'Successfully, created your bot!'
            })
        }
    }).catch(function(error) {
        console.log('Update bot state error: ' + error);

        cb({
            flag: false,
            message: 'Update bot state error'
        })
    });
}

/**
 * @description
 * Get media id list by hashtag from api
 * 
 * @param {OBJECT} session 
 * @param {STRING} hashtag 
 * @param {OBJECT} cb 
 */
function getMediaIdByHashTag(session, hashtag, cb) {
    var feed = new Client.Feed.TaggedMedia(session, hashtag);

    var pFeed = new Promise(function(resolve) {
        return resolve(feed.get());
    });

    pFeed.then(function(results) {
        var arrMediaIdList = [];

        for(var obj of results) {
            arrMediaIdList.push({
                clientId: obj.caption.user_id,
                mediaId: obj.caption.media_id
            });
        }

        cb({
            flag: true,
            data: arrMediaIdList
        });

        arrMediaIdList = [];
    }).catch(function(error) {
        console.log('Get Media Id by hashTag error: ' + error);

        cb({
            flag: false
        })
    });
}

/**
 * @description
 * follow user by user id
 * 
 * @param {OBJECT} session
 * @param {INTEGER} clientId 
 * @param {OBJECT} cb 
 */
function followUserById(session, clientId, cb) {
    Client.Relationship.approvePending(session, clientId)
        .then(function(result) {
            cb({
                data: result.friendship_status.following
            });
        })
}

/**
 * @description
 * follow history to database
 * 
 * @param {OBJECT} data 
 * @param {OBJECT} cb 
 */
function saveFollowUserHistory(data, cb) {
    FollowHistoryModel.create(data)
        .then(function(history) {
            cb({
                flag: true,
                message: 'Save follow Client history id' + history.dataValues.id
            })
        })
        .catch(function(error) {
            console.log('Save follow client history error: ' + error);
        })
}

/**
 * @description
 * commit to posted media by media id
 * 
 * @param {OBJECT} session 
 * @param {INTEGER} mediaId 
 * @param {STRING} commentText 
 * @param {OBJECT} cb 
 */
function commitByMediaId(session, mediaId, commentText, cb) {
    Client.Comment.create(session, mediaId, commentText)
        .then(function(result) {
            cb({
                flag: true,
                data: result
            });
        })
        .catch(function(error) {
            console.log('Commit to post by media id error: ' + error);
            cb({
                flag: false
            })
        });
}

/**
 * @description
 * save commited history
 * 
 * @param {OBJECT} data 
 * @param {OBJECT} cb 
 */
function saveCommitHistory(data, cb) {
    CommentHistoryModel.create(data)
        .then(function() {
            cb({
                flag: true
            })
        })
        .catch(function(error) {
            console.log('Save commit history error: ' + error);
            cb({
                flag: false
            })
        });
}

/**
 * @description
 * get inbox data by account id from Instagram API
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
        var text = '';
        var clientId;
        var arrSendData = [];

        async function getNewInbox() {
            countResult--;

            results[countResult].items.forEach(function(item) {
                text = item._params.text;
                accountId = item._params.userId;
            });

            results[countResult].accounts.forEach(function(account) {
                clientId = account.pk;
            });

            if(accountId == clientId && text != undefined) {
                var objSendData = {
                    text: text,
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
 * Get Count of Reply histories by botid.
 * 
 * @param {INTEGER} botId 
 * @param {INTEGER} clientId
 * @param {OBJECT} cb 
 */
function getCountOfReplyHistoriesById(botId, clientId, cb) {
    var botId = botId;
    var clientId = clientId.toString();

    ReplyHistoryModel.count({
        where: {
            bot_id: botId,
            client_id: clientId
        }
    }).then(function(result) {
        cb(result);
    }).catch(function(error) {
        console.log('Count bot history error: ' + error);
    });
}

/**
 * @description
 * 
 * 
 * @param {OBJECT} session 
 * @param {STRING} clientId 
 * @param {STRING} replyText 
 * @param {OBJECT} cb 
 */
function directMessageToClient(session, clientId, replyText, cb) {
    Client.Thread.configureText(session, clientId, replyText)
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
 * save reply history to database.
 * 
 * @param {OBJECT} data 
 * @param {OBJECT} cb 
 */
function saveReplyHistory(data, cb) {
    ReplyHistoryModel.create(data)
        .then(function(history) {
            cb({
                id: history.dataValues.id
            });
        })
        .catch(function(error) {
            console.log('Create new history error: ' + error);
        });
}

/**
 * @description
 * Get Client id list from replyhistory table.
 * 
 * @param {INTEGER} botId 
 * @param {OBJECT} cb 
 */
function getClientIdList(botId, cb) {
    ReplyHistoryModel.findAll({
        attributes: ['client_id'],
        where: {
            bot_id: botId
        }
    }).then(function(result) { 
        var arrClientId = [];

        for(var obj of result) {
            arrClientId.push(obj.dataValues.client_id);
        }

        cb(arrClientId);

        arrClientId = [];
    }).catch(function(error) {
        console.log('Get Client ID list error: ' + error);
    });
}

/**
 * @description
 * 
 * 
 * @param {OBJECT} data 
 * @param {OBJECT} cb 
 */
function saveFUMHistory(data, cb) {
    FollowUpMessageHistoryModel.create(data)
        .then(function(history) {
            cb(history.dataValues);
        })
        .catch(function(error) {
            console.log('Save follow up message history error: ' + error);
        });
}

/**
 * @description
 * get follower list from database
 * 
 * @param {INTEGER} botId 
 * @param {OBJECT} cb 
 */
function getFollowerList(botId, cb) {
    FollowHistoryModel.findAll({
        where: {
            bot_id: botId,
            is_follow: 'Y'
        }
    }).then(function(results) {
        var arrResult = [];
        for(var obj of results) {
            arrResult.push(obj.dataValues)
        }

        cb(arrResult);

        arrResult = [];
    }).catch(function(error) {
        console.log('Get follower list error: ' + error);
    });
}

/**
 * @description
 * update the followhistory table.
 * 
 * @param {INTEGER} id 
 * @param {OBJECT} cb 
 */
function unFollowUserbyId(id, cb) {
    var updateData = {
        is_follow: 'N'
    }

    FollowHistoryModel.update(updateData, {
        where: {
            id: id
        }
    }).then(function(result) {
        if(result[0] == 1) {
            cb({
                flag: true
            });
        } else {
            cb({
                flag: false
            });
        }
    }).catch(function(error) {
        console.log('Update follow history error: ' + error);

        cb({
            flag: false
        });
    })
}

// Export BotService module.
module.exports = BotService;