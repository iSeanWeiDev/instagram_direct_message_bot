/**
 * @description Bot Service library.
 * @name botService.js
 * @version 2.1.2
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
// var sequelize = new Sequelize('postgres://postgres:Rango941001top@@@@149.28.82.166:5432/instagram_dev');

var Op = Sequelize.Op;

// Definition Bot Service module.
var BotService = {};

// Define BotService Sub Functions.
BotService.validateBot = validateBot; //
BotService.saveBotDetail = saveBotDetail;
BotService.getProxy = getProxy;
BotService.saveFilters = saveFilters;
BotService.saveComment = saveComment;
BotService.getHistoryMediaIdList = getHistoryMediaIdList;
BotService.saveReply = saveReply;
BotService.saveFUMessage = saveFUMessage;
BotService.saveSetting = saveSetting;
BotService.getBotProperties = getBotProperties;
BotService.updateBotState = updateBotState;
BotService.getMediaIdByHashTag= getMediaIdByHashTag;
BotService.followUserById = followUserById; //
BotService.saveFollowUserHistory = saveFollowUserHistory;
BotService.commitByMediaId = commitByMediaId; //
BotService.saveCommitHistory = saveCommitHistory;
BotService.getInboxById = getInboxById; //
BotService.getCountOfReplyHistoriesById = getCountOfReplyHistoriesById;
BotService.directMessageToClient = directMessageToClient; //  
BotService.saveReplyHistory = saveReplyHistory;
BotService.getClientIdList = getClientIdList; //
BotService.saveFUMHistory = saveFUMHistory;
BotService.getFollowerList = getFollowerList;
BotService.unFollowUserbyId = unFollowUserbyId; //
BotService.updateFollowStatus = updateFollowStatus;
BotService.getAllBotsDetail = getAllBotsDetail;
BotService.deleteBotById = deleteBotById;
// ==> bot management part functions
BotService.getLoadMore = getLoadMore;
BotService.getBotHistoryData = getBotHistoryData;
BotService.getMessageHistoryById = getMessageHistoryById;
BotService.getDashboardHistory = getDashboardHistory;
BotService.getBotGeneralDetail = getBotGeneralDetail;
BotService.changeBotStatusById = changeBotStatusById;
// update bot by bot id => allbots page
BotService.updateBotSettingbyId = updateBotSettingbyId
BotService.updateFiltersByBotid = updateFiltersByBotid;
BotService.updateCommentsByBotid = updateCommentsByBotid;
BotService.updateRepliesByBotid = updateRepliesByBotid;
BotService.updateFUMsByBotid = updateFUMsByBotid;
// BotService.UpdateBotForChallenge = UpdateBotForChallenge;

// challenge
BotService.getChallengeList = getChallengeList; 
BotService.getBotPropertiesForChallenge = getBotPropertiesForChallenge;
BotService.saveChallengeHistory = saveChallengeHistory;
BotService.makeChallengePhone = makeChallengePhone;
BotService.verifyPhone = verifyPhone;

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
var ChallengeModel = require('../models').Challenge;
var ChallengeHitoryModel = require('../models').ChallengeHistory;

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
                        cb({
                            flag: false,
                            type: error.name,
                        })
                        console.log('Fetch user picture error: ' + error);
                    });
            }
        })
        .catch(function(error) {
            cb({
                flag: false,
                type: error.name
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

            cb({
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
                                A.state < 3
                                AND A."expire_date" > DATE(now())
                                AND A."is_deleted" = 'N'
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
 * 
 * @param {Integer} botId 
 * @param {object} cb 
 */
function getHistoryMediaIdList(botId, cb) {

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
        max_comment: maxComment,
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
                                    is_activated: 'Y',
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
        is_activated: 'Y',
        state: 1
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
        });
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

        if(results.length > 0) {
            for(var obj of results) {
                arrMediaIdList.push({
                    clientId: obj.caption.user_id,
                    mediaId: obj.caption.media_id
                });
            }
    
            cb({
                flag: true,
                is_challenge: false,
                data: arrMediaIdList
            });
    
            arrMediaIdList = [];
        } else {
            cb({
                flag: false,
                is_challenge: false,
                data: arrMediaIdList
            });
        }
    }).catch(function(error) {
        console.log('Get Media Id by hashTag error: ' + error);

        cb({
            flag: false,
            is_challenge: true,
            data: error.name
        });
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
            if(result.friendship_status.following == false) {
                Client.Relationship.create(session, clientId)
                    .then(function(follow) {
                        cb({
                            flag: true,
                            data: follow.params
                        });
                    })
                    .catch(function(error) {
                        cb({
                            flag: false,
                            data: error.name
                        })

                        console.log('Create relationship error: ' + error);
                    })
            } 
            
        })
        .catch(function(error) {
            cb({
                flag: false,
                data: error.name
            })

            console.log('Follow user by id error: ' + error);
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
                flag: true
            })
        })
        .catch(function(error) {
            console.log('Save follow client history error: ' + error);

            cb({
                flag: false
            })
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
                flag: false,
                data: error.name
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
        if(results.length > 0) {
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

            cb({
                flag: true,
                data: arrSendData
            });

            arrSendData = [];
        }
    });

    pFeed.catch(function(error) {
        cb({
            flag: false,
            data: error.name
        })
    })
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
            client_id: clientId,
            is_manual: 'N'
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

            cb({
                flag: true,
                data: sendData
            });
        })
        .catch(function(error) {
            cb({
                flag: false,
                data: error.name
            })

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
                flag: true,
                data: history.dataValues.id
            });
        })
        .catch(function(error) {
            cb({
                flag: false,
                data: error
            })
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

        if(result.length > 0) {
            for(var obj of result) {
                arrClientId.push(obj.dataValues.client_id);
            }
    
            cb(arrClientId);
    
            arrClientId = [];
        } else {
            cb(arrClientId);
        }
        
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
            cb({
                flag: true,
                data: history.dataValues
            });
        })
        .catch(function(error) {
            cb({
                flag: false,
                data: error.name
            });

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
 * @param {OBJECT} session
 * @param {INTEGER} clientId 
 * @param {OBJECT} cb 
 */
function unFollowUserbyId(session, clientId, cb) {
    Client.Relationship.removeFollower(session, clientId)
        .then(function(result) {
            cb({
                flag: true,
                data: result
            })            
        })
        .catch(function(error) {
            cb({
                flag: false,
                data: error.name
            })

            console.log('Follow user by id error: ' + error);
        });
}

/**
 * @description
 * update follow status for unfollow user
 * 
 * @param {*} id 
 * @param {*} cb 
 */
function updateFollowStatus(id, cb) {
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

/**
 * @description
 * Get all bots details for initialize the allbots page.
 * 
 * @param {INTEGER} id 
 * @param {OBJECT} cb 
 */
function getAllBotsDetail(id, cb) {
    var getData = new Promise(function(resolve) {
        BotModel.findAll({
            attributes: [
                'id', 
                'bot_name', 
                'account_name', 
                'account_password', 
                'account_image_url', 
                'message_delay', 
                'max_comment',
                'is_activated',
                'state'
            ],
            where: {
                state: {
                    [Op.gt]: 0
                },
                user_id: id
            }
        }).then(function(bots) {
            if(bots.length > 0) {
                var arrBotDetails = [];
                var countOfBot = bots.length - 1;
        
                async function asyncGetBotsDetails() {
                    var objBotDetail = {
                        bot: [],
                        filters: [],
                        comments: [],
                        replies: [],
                        fums: []
                    }
        
                    var botId = bots[countOfBot].dataValues.id;
                    
                    objBotDetail.bot.push(bots[countOfBot].dataValues);
        
                    FilterModel.findAll({
                        attributes: [
                            'id', 'hashtag'
                        ],
                        where: {
                            bot_id: botId,
                            state: 1  
                        }
                    }).then(function(filters) {
                        filters.forEach(filter => {
                            objBotDetail.filters.push(filter.dataValues);
                        });
        
                        CommentModel.findAll({
                            attributes: [
                                'id', 'text'
                            ],
                            where: {
                                bot_id: botId,
                                state: 1
                            }
                        }).then(function(comments) {
                            comments.forEach(comment => {
                                objBotDetail.comments.push(comment.dataValues);
                            });
        
        
                            ReplyModel.findAll({
                                attributes: [
                                    'id', 'text'
                                ],
                                where: {
                                    bot_id: botId,
                                    state: 1
                                }
                            }).then(function(replies) {
                                replies.forEach(reply => {
                                    objBotDetail.replies.push(reply.dataValues);
                                });
        
                                FUMModel.findAll({
                                    attributes: [
                                        'id', 'start_date', 'text'
                                    ],
                                    where: {
                                        bot_id: botId,
                                        state: 1
                                    }
                                }).then(function(fums) {
                                    fums.forEach(fum => {
                                        objBotDetail.fums.push(fum.dataValues);
                                    });
    
                                    arrBotDetails.push(objBotDetail);
    
                                    countOfBot--;
    
                                    if(countOfBot >= 0) {
                                        asyncGetBotsDetails();
                                    } else {
                                        resolve(arrBotDetails);
                                        arrBotDetails = [];
                                    }
                                });
                            });
                        });
                    });
                }
        
                asyncGetBotsDetails();  
            } else {
                resolve([]);
            }
        });
    });

    getData.then(function(result) {
        cb(result);
    });
}

/**
 * @description
 * delete by botid
 * 
 * @param {OBJECT} data 
 * @param {OBJECT} cb 
 */
function deleteBotById(data, cb) {
    var updateBotData = {
        state: 0
    }
    BotModel.update(updateBotData, {
        where: {
            id: data.botId,
            user_id: data.userId
        }
    }).then(function(response) {
        if(response[0] == 1) {
            cb({
                flag: true,
                message:'Successfully deleted'
            });
        }
    }).catch(function(error) {
        console.log('Delete Bot Error: ' + error);

        cb({
            flag: false,
            message:'Failed deleting'
        })
    });
}

/**
 * @description
 * get loadmore details
 * 
 * @param {INTEGER} userId 
 * @param {INTEGER} botId 
 * @param {OBJECT} cb 
 */
function getLoadMore(userId, botId, cb) {
    var selectQuery =  `(SELECT 'filters' AS type,
                            B.hashtag AS data
                        FROM
                            "public"."Bots" AS A,
                            "public"."Filters" AS B
                        WHERE
                            A.id = B.bot_id
                            AND A.id = ?
                            AND A.user_id = ?
                        ORDER BY
                            B."createdAt")

                        UNION ALL

                        (SELECT 'comment' AS type,
                            B.text AS data
                        FROM
                            "public"."Bots" AS A,
                            "public"."Comments" AS B
                        WHERE
                            A.id = B.bot_id
                            AND A.id = ?
                            AND A.user_id = ?
                        ORDER BY
                            B."createdAt")

                        UNION ALL

                        (SELECT 'reply' as type,
                            B.text AS data
                        FROM
                            "public"."Bots" AS A,
                            "public"."Replies" AS B
                        WHERE
                            A.id = B.bot_id
                            AND A.id = ?
                            AND A.user_id = ?
                        ORDER BY
                            B."createdAt")`;

    sequelize.query(selectQuery, {
        replacements: [
            botId,
            userId,
            botId,
            userId,
            botId,
            userId
        ],
        type: sequelize.QueryTypes.SELECT
    }).then(function(result) {
        cb(result);
    }).catch(function(error) {
        console.log('Get all bots detail error:' + error);
    })
}

/**
 * @description
 * get all bot activity history
 * 
 * @param {INTEGER} userId 
 * @param {OBJECT} cb 
 */
function getBotHistoryData(userId, cb) {
    var selectQuery = ` SELECT
                            B.id, 
                            B.bot_name, 
                            C.client_id, 
                            C.client_name, 
                            C.client_image_url,
                            MAX(C."createdAt") AS max,
                            COUNT(C.client_text) AS count
                        FROM
                            "public"."Users" AS A,
                            "public"."Bots" AS B,
                            "public"."ReplyHistories" AS C	
                        WHERE
                            A.id = B.user_id
                            AND B.id = C.bot_id
                            AND A.id = ?
                        GROUP BY
                            B."createdAt",
                            B.id, 
                            B.bot_name, 
                            C.client_id, 
                            C.client_name, 
                            C.client_image_url 
                        ORDER BY 
                            B."createdAt" DESC;`;
    sequelize.query(selectQuery, { 
        replacements: [userId], 
        type: sequelize.QueryTypes.SELECT 
    }).then(function(result) {
        var arrSendData = [];

        for(var obj of result) {
            convertTime(obj.max, function(cb) {
                var last = cb;

                arrSendData.push({
                    botId: obj.id,
                    botName: obj.bot_name,
                    clientId: obj.client_id,
                    clientName: obj.client_name,
                    imageUrl: obj.client_image_url,
                    last: last,
                    count: obj.count
                })
            });
        }

        cb(arrSendData);

        arrSendData = [];
    }).catch(function(error) {
        console.log('Get Bot History Data error: ' + error);
    });

}

/**
 * @description
 * Get Bot Message history by botid
 * 
 * @param {INTEGER} userId
 * @param {INTEGER} botId
 * @param {INTEGER} clientId 
 * @param {OBJECT} cb 
 */
function getMessageHistoryById(userId, botId, clientId, cb) {
    var selectQuery = ` SELECT
                            B.id,
                            B.bot_name,
                            C.text,
                            D.client_id,
                            D.client_name,
                            D."createdAt",
                            D.client_text
                        FROM
                            "public"."Users" AS A,
                            "public"."Bots" AS B,
                            "public"."Replies" AS C,
                            "public"."ReplyHistories" AS D
                        WHERE
                            A.id = B.user_id
                            AND B.id = C.bot_id
                            AND B.id = D.bot_id
                            AND C.id = D.reply_id
                            AND A.id = ?
                            AND B.id = ?
                            AND D.client_id = ?
                        ORDER BY
                            D."createdAt" `;
    sequelize.query(selectQuery, {
        replacements: [
            userId,
            botId,
            clientId
        ]
    }).then(function(result) {
        cb(result[0]);
    }).catch(function(error) {
        console.log('Get History count data error: ' + error);
    });
}

/**
 * @description
 * get dashboard history data by state
 * 
 * @param {INTEGER} state 
 * @param {INTEGER} userId 
 * @param {OBJECT} cb 
 */
function getDashboardHistory(state, userId, cb) {
    var selectQuery = '';
    switch (state) {
        case 1: // tody
            selectQuery = ` (SELECT  'reply' AS type,
                                aa.state,
                                aa.bot_id,
                                aa.bot_name ,
                                count(aa.client_id) 
                            FROM (
                                SELECT 
                                    B.state,
                                    B.id AS bot_id,
                                    B.bot_name AS bot_name,
                                    C.client_id
                                FROM
                                    "public"."Users" AS A,
                                    "public"."Bots" AS B,
                                    "public"."ReplyHistories" AS C
                                WHERE
                                    A.id = B.user_id
                                    AND B.id = C.bot_id
                                    AND A.id = ?
                                    AND DATE(C."createdAt") = DATE(now())
                                GROUP BY B.state, B.id, B.bot_name, C.client_id 
                            ) AS aa
                            GROUP BY 
                                aa.state,
                                aa.bot_id,
                                aa.bot_name) 
                            
                            UNION ALL
                            
                            (SELECT 'comment' AS type,
                                B.state,
                                B.id,
                                B.bot_name,
                                COUNT(B.id)
                            FROM
                                "public"."Users" AS A,
                                "public"."Bots" AS B,
                                "public"."CommentHistories" AS C
                            WHERE
                                A.id = B.user_id
                                AND B.id = C.bot_id
                                AND A.id = ?
                                AND DATE(C."createdAt") = DATE(now())
                            GROUP BY
                                B.state,
                                B.id,
                                B.bot_name
                            ORDER BY
                                B.id) `;
            break;
        case 2: // Yesterday
            selectQuery = ` (SELECT  'reply' AS type,
                                aa.state,
                                aa.bot_id,
                                aa.bot_name ,
                                count(aa.client_id) 
                            FROM (
                                SELECT 
                                    B.state,
                                    B.id AS bot_id,
                                    B.bot_name AS bot_name,
                                    C.client_id
                                FROM
                                        "public"."Users" AS A,
                                        "public"."Bots" AS B,
                                        "public"."ReplyHistories" AS C
                                WHERE
                                        A.id = B.user_id
                                        AND B.id = C.bot_id
                                        AND A.id = ?
                                        AND DATE(C."createdAt") BETWEEN DATE(NOW())-1 AND DATE(NOW())
                                GROUP BY 
                                    B.state,
                                    B.id, 
                                    B.bot_name, 
                                    C.client_id 
                            ) AS aa
                            GROUP BY
                                aa.state,
                                aa.bot_id,
                                aa.bot_name) 
                            
                            UNION ALL
                            
                            (SELECT 'comment' AS type,
                                B.state,
                                B.id,
                                B.bot_name,
                                COUNT(B.id)
                            FROM
                                "public"."Users" AS A,
                                "public"."Bots" AS B,
                                "public"."CommentHistories" AS C
                            WHERE
                                A.id = B.user_id
                                AND B.id = C.bot_id
                                AND A.id = ?
                                AND DATE(C."createdAt") BETWEEN DATE(NOW())-1 AND DATE(NOW())
                            GROUP BY
                                B.state,
                                B.id,
                                B.bot_name
                            ORDER BY
                                B.id) `;
            break;
        case 3: // Week
            selectQuery = ` (SELECT  'reply' AS type,
                                aa.state,
                                aa.bot_id,
                                aa.bot_name,
                                count(aa.client_id) 
                            FROM (
                                SELECT 
                                    B.state,
                                    B.id AS bot_id,
                                    B.bot_name AS bot_name,
                                    C.client_id
                                FROM
                                    "public"."Users" AS A,
                                    "public"."Bots" AS B,
                                    "public"."ReplyHistories" AS C
                                WHERE
                                    A.id = B.user_id
                                    AND B.id = C.bot_id
                                    AND A.id = ?
                                    AND DATE(C."createdAt") BETWEEN DATE(now()) - 7 AND DATE(now())
                                GROUP BY 
                                    B.state,
                                    B.id, 
                                    B.bot_name, 
                                    C.client_id 
                            ) AS aa
                            GROUP BY 
                                aa.state,
                                aa.bot_id,
                                aa.bot_name) 
                            
                            UNION ALL
                            
                            (SELECT 'comment' AS type,
                                B.state,
                                B.id,
                                B.bot_name,
                                COUNT(B.id)
                            FROM
                                "public"."Users" AS A,
                                "public"."Bots" AS B,
                                "public"."CommentHistories" AS C
                            WHERE
                                A.id = B.user_id
                                AND B.id = C.bot_id
                                AND A.id = ?
                                AND DATE(C."createdAt") BETWEEN DATE(now()) - 7 AND DATE(now())
                            GROUP BY
                                B.state,
                                B.id,
                                B.bot_name
                            ORDER BY
                                B.id) `;
                break;
            case 4: // Month
                selectQuery = ` (SELECT  'reply' AS type,
                                    aa.state,
                                    aa.bot_id,
                                    aa.bot_name ,
                                    count(aa.client_id) 
                                FROM (
                                    SELECT 
                                        B.state,
                                        B.id AS bot_id,
                                        B.bot_name AS bot_name,
                                        C.client_id
                                    FROM
                                        "public"."Users" AS A,
                                        "public"."Bots" AS B,
                                        "public"."ReplyHistories" AS C
                                    WHERE
                                        A.id = B.user_id
                                        AND B.id = C.bot_id
                                        AND A.id = ?
                                        AND DATE(C."createdAt") BETWEEN DATE(DATE(NOW()) - interval '1 month') AND DATE(NOW())
                                    GROUP BY 
                                        B.state,
                                        B.id,
                                        B.bot_name, 
                                        C.client_id 
                                ) AS aa
                                GROUP BY 
                                    aa.state,
                                    aa.bot_id,
                                    aa.bot_name) 
                                
                                UNION ALL
                                
                                (SELECT 'comment' AS type,
                                    B.state,
                                    B.id,
                                    B.bot_name,
                                    COUNT(B.id)
                                FROM
                                    "public"."Users" AS A,
                                    "public"."Bots" AS B,
                                    "public"."CommentHistories" AS C
                                WHERE
                                    A.id = B.user_id
                                    AND B.id = C.bot_id
                                    AND A.id = ?
                                    AND DATE(C."createdAt") BETWEEN DATE(DATE(NOW()) - interval '1 month') AND DATE(NOW())
                                GROUP BY
                                    B.state,
                                    B.id,
                                    B.bot_name
                                ORDER BY
                                    B.id) `;
                break;
            case 5: // year
                selectQuery = ` (SELECT  'reply' AS type,
                                    aa.state,
                                    aa.bot_id,
                                    aa.bot_name ,
                                    count(aa.client_id) 
                                FROM (
                                    SELECT 
                                        B.state,
                                        B.id AS bot_id,
                                        B.bot_name AS bot_name,
                                        C.client_id
                                    FROM
                                        "public"."Users" AS A,
                                        "public"."Bots" AS B,
                                        "public"."ReplyHistories" AS C
                                    WHERE
                                        A.id = B.user_id
                                        AND B.id = C.bot_id
                                        AND A.id = ?
                                        AND DATE(C."createdAt") BETWEEN DATE(DATE(NOW()) - interval '1 year') AND DATE(NOW())
                                    GROUP BY 
                                        B.state,
                                        B.id, 
                                        B.bot_name, 
                                        C.client_id 
                                ) AS aa
                                GROUP BY
                                    aa.state,
                                    aa.bot_id,
                                    aa.bot_name) 
                                
                                UNION ALL
                                
                                (SELECT 'comment' AS type,
                                    B.state,
                                    B.id,
                                    B.bot_name,
                                    COUNT(B.id)
                                FROM
                                    "public"."Users" AS A,
                                    "public"."Bots" AS B,
                                    "public"."CommentHistories" AS C
                                WHERE
                                    A.id = B.user_id
                                    AND B.id = C.bot_id
                                    AND A.id = ?
                                    AND DATE(C."createdAt") BETWEEN DATE(DATE(NOW()) - interval '1 year') AND DATE(NOW())
                                GROUP BY
                                    B.state,
                                    B.id,
                                    B.bot_name
                                ORDER BY
                                    B.id) `;

                break;

            default:
                break;
    }

    sequelize.query(selectQuery, {
        replacements: [
            userId,
            userId
        ]
    }).then(function(result) {
        cb(result[0]);
    }).catch(function(error) {
        console.log('Get History count data error: ' + error);
    });
}


/**
 * @description
 * send message manually by botid and clientid
 * 
 * @param {OBJECT} data 
 * @param {OBJECT} cb 
 */
function getBotGeneralDetail(data, cb) {
    BotModel.findOne({
        attributes: [
            'account_name',
            'account_password'
        ],
        where: {
            id: data.botId
        }
    }).then(function(bot) {
        ProxyUsageHistoryModel.findOne({
            attributes: ['proxy_url'],
            where: {
                bot_id: data.botId
            }
        }).then(function(proxy) {
            cb({
                accountName: bot.dataValues.account_name,
                accountPass: bot.dataValues.account_password,
                proxyUrl: proxy.dataValues.proxy_url
            })
        }).catch(function(error) {
            console.log('Get current proxy error: ' + error);
        });
    }).catch(function(error) {
        console.log('Get current bot error: ' + error);
    });
}

/**
 * @description
 * pause the bot status
 * 
 * @param {OBJECT} data 
 * @param {OBJECT} cb 
 */
function changeBotStatusById(data, cb) {
    var updateData = {
        is_activated: data.is_activated
    }

    BotModel.update(updateData, {
        where: {
            id: data.botId
        }
    }).then(function(result) {
        if(result[0] == 1) {
            cb({
                flag: true
            });
        }
    }).catch(function(error) {
        console.log('Update bot status error: ' + error);
        cb({
            flag: false
        });
    });
}

// Update the bot by bot id.

/**
 * @description
 * update the stored bot setting
 * 
 * @param {INTEGER} botId 
 * @param {OBJECT} data 
 * @param {OBJECT} cb 
 */
function updateBotSettingbyId(botId, data, cb) {
    BotModel.update(data, {
        where: {
            id:  botId
        }
    }).then(function() {
        cb({
            flag: true
        });
    }).catch(function(error) {
        console.log('Update bot setting error:' + error);
        cb({
            flag: false
        });
    })
}

/**
 * @description
 * update the stored hashtags
 * before update the bot hashtags, might delete last hashtags
 * 
 * @param {INTEGER} botId 
 * @param {OBJECT} data 
 * @param {OBJECT} cb 
 */
function updateFiltersByBotid(botId, data, cb) {
    var arrFilters = [];

    for(var obj of data) {
        arrFilters.push({
            bot_id: botId,
            hashtag: obj,
            state: 1
        })
    }

    var updateQuery = ` UPDATE
                            "public"."Filters"
                        SET 
                            state = 0
                        WHERE 
                            bot_id = ? `;

    sequelize.query(updateQuery, {
        replacements: [
            botId
        ],
        type: sequelize.QueryTypes.UPDATE
    }).then(function() {

        FilterModel.bulkCreate(arrFilters)
            .then(function() {
                cb({
                    flag: true
                });

                arrFilters = [];
            })
            .catch(function(error) {
                console.lo(error);

                cb({
                    flag: false
                })
            });


        
    }).catch(function(error) {
        cb({
            flag: false
        })
        console.log('Get all bots detail error:' + error);
    })
}

/**
 * @description
 * update comments by bot id
 * before update the bot comments, might delete last comments
 * 
 * @param {INTEGER} botId 
 * @param {OBJECT} data 
 * @param {OBJECT} cb 
 */
function updateCommentsByBotid(botId, data, cb) {
    var arrComment = [];

    for(var obj of data) {
        arrComment.push({
            bot_id: botId,
            text: obj,
            state: 1
        })
    }

    var updateQuery = ` UPDATE
                            "public"."Comments"
                        SET 
                            state = 0
                        WHERE 
                            bot_id = ? `;

    sequelize.query(updateQuery, {
        replacements: [
            botId
        ],
        type: sequelize.QueryTypes.UPDATE
    }).then(function() {
        CommentModel.bulkCreate(arrComment)
            .then(function() {
                cb({
                    flag: true
                });
                arrComment = [];
            })
            .catch(function(error) {
                cb({
                    flag: false
                });
            });
    }).catch(function(error) {
        cb({
            flag: false
        });

        console.log(error);
    });
}

/**
 * @description
 * update replies by bot id
 * before update the bot direct messages, might delete direct messages
 * 
 * @param {INTEGER} botId 
 * @param {OBJECT} data 
 * @param {OBJECT} cb 
 */
function updateRepliesByBotid(botId, data, cb) {
    var arrReply = [];

    for(var obj of data) {
        arrReply.push({
            bot_id: botId,
            text: obj,
            state: 1
        })
    }

    var updateQuery = ` UPDATE
                            "public"."Replies"
                        SET 
                            state = 0
                        WHERE 
                            bot_id = ? `;

    sequelize.query(updateQuery, {
        replacements: [
            botId
        ],
        type: sequelize.QueryTypes.UPDATE
    }).then(function() {

        ReplyModel.bulkCreate(arrReply)
            .then(function() {
                cb({
                    flag: true
                });
                arrReply = [];
            })
            .catch(function(error) {
                cb({
                    flag: false
                });

                console.log(error);
            });
    }).catch(function(error) {
        cb({
            flag: false
        });

        console.log(error);
    });
}

/**
 * @description
 * update follow up messages by bot id
 * before update the bot follow up messages, might delete follow up messages
 * 
 * @param {INTEGER} botId 
 * @param {OBJECT} data 
 * @param {OBJECT} cb 
 */
function updateFUMsByBotid(botId, data, cb) {
    var miliDayList = [ '172800000', 
                        '518400000', 
                        '1036800000', 
                        '1814400000', 
                        '2592000000', 
                        '5184000000', 
                        '7776000000', 
                        '10368000000'];

    var arrFUM = [];

    for(var i = 0; i < data.length; i++) {
        var miliTime = (new Date()).getTime() + parseInt(miliDayList[i]);
        var isoTime = (new Date(miliTime)).toISOString();

        arrFUM.push({
            bot_id: botId,
            start_date: isoTime,
            text: data[i],
            state: 1
        });
    }

    var updateQuery = ` UPDATE
                            "public"."FollowUpMessages"
                        SET 
                            state = 0
                        WHERE 
                            bot_id = ? `;

    sequelize.query(updateQuery, {
        replacements: [
            botId
        ],
        type: sequelize.QueryTypes.UPDATE
    }).then(function() {

        FUMModel.bulkCreate(arrFUM)
            .then(function() {
                cb({
                    flag: true
                });

                arrFUM = [];
            })
            .catch(function(error) {
                cb({
                    flag: false
                });

                console.log('Bulk insert error: ' +  error);
            });
    }).catch(function(error) {
        cb({
            flag: false
        });

        console.log('Update the follow up message to safe delete error: ' + error);
    });
}

/**
 * @description
 * Update the bot state with challenge id.
 * 
 * @param {INTEGER} botId 
 * @param {INTEGER} challengeId 
 * @param {OBJECT} cb 
 */
// function UpdateBotForChallenge(botId, challengeId, cb) {
//     var updateData = {
//         state: parseInt(challengeId) + 1,
//         is_activated: 'N'
//     }
//     BotModel.update(updateData, {
//         where: {
//             id: botId
//         }
//     }).then(function(result) {
//         if(result[0] == 1) {
//             cb(true);
//         } else {
//             cb(false);
//         }
//     }).catch(function(error) {
//         cb(false);
//         console.log("update bot for challenge error: " + error);
//     });
// }


/**
 * @description
 * get challenge list to show the notification to user
 * 
 * @param {OBJECT} cb 
 */
function getChallengeList(cb) {
    ChallengeModel.findAll({
        attributes: [
            'id', 'type', 'data', 'message'
        ],
        where: {
            state: 1
        }
    }).then(function(challenges) {
        // return data using callback.
        cb(challenges);
    }).catch(function (error) {
        if(error) {
            console.log('Get challenge list error' + error);
        }
    });
}

/**
 * @description
 * Get bot properties for challenge.
 * 
 * @param {INTEGER} botId 
 * @param {OBJECT} cb 
 */
function getBotPropertiesForChallenge(botId, cb) { 
    BotModel.findOne({
        attributes: [
            'id', 'bot_name', 'account_name', 'account_image_url'
        ],
        where: {
            id: botId
        }
    }).then(function (bot) {
        cb(bot);
    }).catch(function(error) {
        console.log('Get bot properties for challenge error: ' + error);
    });
}

/**
 * @description
 * save the challenge history to database.
 * 
 * @param {OBJECT} data 
 * @param {FLAG} cb 
 */
function saveChallengeHistory(data, cb) {
    ChallengeHitoryModel.create(data)
        .then(function (res) {
            cb(true)
        })
        .catch(function (error) {
            cb(false);

            console.log('Save challenge history error: ' + error);
        });
}

/**
 * @description
 * make verifiy using phone number.
 * 
 * @param {INTEGER} botId 
 * @param {STRING} phoneNumber
 * @param {OBJECT} cb 
 */
function makeChallengePhone(botId, phone, cb) {
    BotModel.findOne({
        attributes: [
            'account_name', 'account_password'
        ],
        where: {
            id: botId
        }
    }).then(function(botCB) {
        var name = botCB.dataValues.account_name;
        var password = botCB.dataValues.account_password;
        var phoneNumber = phone;

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
                    cb({
                        flag: true
                    })
                }
            })
            .catch(Client.Exceptions.CheckpointError, function(error) {
                Client.Web.PhoneVerificationChallenge.resolve(error)
                    .then(function(challenge) {
                        challenge.phone(phoneNumber);

                        cb({
                            flag: true
                        })
                    })
                    .catch(function(error) {
                        cb({
                            flag: error,
                            data: error.name
                        })

                        console.log('Instagram phone verification error: ' + error);
                    });
            });
    }).catch(function(error) {
        cb({
            flag: false,
            type: error
        });
    });
}

/**
 * @description
 * verification using phone verification code.
 * 
 * @param {INTEGER} botId 
 * @param {INTEGER} code 
 * @param {OBJECT} cb 
 */
function verifyPhone(botId, code, cb) {
    BotModel.findOne({
        attributes: [
            'account_name', 'account_password'
        ],
        where: {
            id: botId
        }
    }).then(function(botCB) {
        var name = botCB.dataValues.account_name;
        var password = botCB.dataValues.account_password;
        var verifyCode = code;

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
                    cb({
                        flag: true
                    })
                }
            })
            .catch(Client.Exceptions.CheckpointError, function(error) {
                Client.Web.Challenge.resolve(error)
                    .then(function(challenge) {
                        challenge.code(verifyCode);

                        cb({
                            flag: true
                        })
                    })
                    .catch(function (error) {
                        cb({
                            flag: false,
                            data: error
                        })
                    });
            });
    }).catch(function(error) {
        cb({
            flag: false,
            type: error
        });
    });
    
}



/**
 * @description
 * Convert time to 
 * 
 * @param {INTEGER} mili 
 * @param {OBJECT} callback 
 */
function convertTime(mili, callback) {
    var delta = parseInt((parseInt(new Date().getTime()) - parseInt(new Date(mili).getTime())) / ( 1000 * 60 ));

    if( delta < 60 ) {
        callback(delta + ' minutes ago'); 
    } else if( delta < 1440) {
        var time = parseInt(delta / 60)
        callback(time + ' hours ago');
    } else if( delta < 43200 ) {
        var time = parseInt(delta /  1440);
        callback(time + ' days ago');
    } else if( delta < 10080 ) {
        var time = parseInt(delta /  1440);
        callback(time + ' weeks ago');
    } else if(delta < 525600) {
        var time = parseInt(delta /  43200);
        callback(time + ' months ago');
    } else if(525600 < delta) {
        var time = parseInt(delta /  525600);
        callback(time + ' years ago');
    }
}

// Export BotService module.
module.exports = BotService;