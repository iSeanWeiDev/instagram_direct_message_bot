// new instagram bot.
'use strict';

// Import service for manage bot.
var BotService = require('../services/botService');
var initializeData = {};

var gSession = {};
var gMediaIdList = [];
var gStartCommentTime = 0; // initialize the start time for comment
var gStartDirectMessageTime = 0; // initialize the start time for direct message
var gStartUnFollowTime = (new Date()).getTime(); // initialize the start time for un-follow.
var gIndexOfFUM = 0;


// Receive data using "message" method from parent process.
process.on('message', function(data) {
    initializeData = data;

    // Initialize the global session when we get the created bot
    if(data.is_activated == 'Y' && data.is_created == 'Y' && data.is_updated == 'N') {
        var accountName = initializeData.bot.account_name;
        var accountPass = initializeData.bot.account_password;
        var proxyUrl = initializeData.proxy.proxy_url;

        BotService.validateBot(accountName, accountPass, proxyUrl, function(result) {
            if(result.flag == true) {
                // initialize the global session.
                gSession = result.session;
                // make flag "Create" false.
                flagOfIsCreated = false;
            } else {
                process.send({
                    type: 1,
                    flag: false,
                    error: result.type
                });
            }
        });
    }

    // Initialize the global session when we get the updated bot
    if(data.is_activated == 'Y' && data.is_created == 'N' && data.is_updated == 'Y') {
        var accountName = initializeData.bot.account_name;
        var accountPass = initializeData.bot.account_password;
        var proxyUrl = initializeData.proxy.proxy_url;

        BotService.validateBot(accountName, accountPass, proxyUrl, function(result) {
            if(result.flag == true) {
                // initialize the global session.
                gSession = result.session;
                // make flag "Update" false.
                flagOfIsUpdated = false;
            } else {
                process.send({
                    type: 2,
                    flag: false,
                    error: result.type
                });
            }
        });
    }

    // Initialize the global session when we get the Activated bot
    if(data.is_activated == 'Y' && data.is_created == 'N' && data.is_updated == 'N') {
        var accountName = initializeData.bot.account_name;
        var accountPass = initializeData.bot.account_password;
        var proxyUrl = initializeData.proxy.proxy_url;

        BotService.validateBot(accountName, accountPass, proxyUrl, function(result) {
            if(result.flag == true) {
                // initialize the global session.
                gSession = result.session;
                // make flag "Activate" false.
                flagOfIsActivated = false;
            } else {
                process.send({
                    type: 3,
                    flag: false,
                    error: result.type
                });
            }
        });
    }

    // Initialize the global session when we get the Deactivated bot
    if(data.is_activated == 'N' && data.is_created == 'N' && data.is_updated == 'N') {
        // make flag "Deactivate" false.
        flagOfIsDeactivated = false;
    }
});

/**
 * process.send(1) : create bot
 * process.send(2) : updated bot
 * process.send(3) : changed status: activated
 * process.send(4) : changed status: disactivated
 * process.send(5) : challenge required
 */

// Global flags
var flagOfIsCreated = true;
var flagOfIsUpdated = true;
var flagOfIsActivated = true;
var flagOfIsDeactivated = true;
var initCountOfMediaList = 0;

/* ===================================================< Begin Create bot >=========================================================== */
setInterval(() => {
    // Created bot controller part.
    if(initializeData.is_activated == 'Y' && initializeData.is_created == 'Y' && initializeData.is_updated == 'N') {
        // Global initialized values from server.
        var botId = initializeData.bot.id;
        var messageDelay = initializeData.bot.message_delay;
        var maxComment = initializeData.bot.max_comment;
        var arrFilter = initializeData.filters;
        var arrComment = initializeData.comments;
        var arrReply = initializeData.replies;
        var arrFUM = initializeData.fums;

        // Global comment values.
        var countOfFilters = arrFilter.length;
        var miliDay = 1000 * 60 * 60 * 24;// milisecond
        var deltaCommentTime = parseInt(miliDay/maxComment);
        var hashtag = arrFilter[countOfFilters-1].hashtag;
        var crrCommentServerTime = (new Date()).getTime(); // milisecond

        /**
         * @description
         * Comment by filter logic
         */
        if(gMediaIdList.length > 0 && arrComment.length > 0) {
            if(crrCommentServerTime - gStartCommentTime > deltaCommentTime) {
                initCountOfMediaList++;

                var countOfMediaList = gMediaIdList.length;
                countOfMediaList = countOfMediaList - initCountOfMediaList;

                var mediaId = gMediaIdList[countOfMediaList].mediaId;
                var followClientId = gMediaIdList[countOfMediaList].clientId;
                var indexOfComment = getRandomInt(arrComment.length); 
                var commentText = arrComment[indexOfComment].text;
                var commentId = arrComment[indexOfComment].id;

                // comment to post by media id.
                BotService.commitByMediaId(gSession, mediaId, commentText, function(resultOfCommit) {
                    if(resultOfCommit.flag == true) {
                        // Define new commit history data
                        var commitHistoryData = {
                            bot_id: botId,
                            filter_id: arrFilter[countOfFilters-1].id,
                            media_id: mediaId,
                            comment_id: commentId
                        }
                        
                        // save the comment history for next step.
                        BotService.saveCommitHistory(commitHistoryData, function(saveCommitHistoryData) {
                            if(saveCommitHistoryData.flag == true) {
                                console.log("Comment successed"+botId);
                            }
                        });

                        // follow users by client id.
                        BotService.followUserById(gSession, followClientId, function(followCB) {
                            if(followCB.flag == true) {
                                var followHistoryData = {
                                    bot_id: botId,
                                    client_id: followClientId,
                                    is_follow: 'Y'
                                }

                                // save follower history to database.
                                BotService.saveFollowUserHistory(followHistoryData, function(historyCB) {
                                    if(historyCB.flag == true) {
                                        console.log("Pendding follow user success"+botId);
                                    }
                                });
                            } else {
                                // Challenge => follow user by id.
                                process.send({
                                    type: 5,
                                    flag: true,
                                    botId: botId,
                                    message: followCB.data
                                })

                            }
                        });
                    } else {
                        // Challenge => commit by media id
                        process.send({
                            type: 5,
                            flag: true,
                            botId:botId,
                            message: resultOfCommit.data
                        })
                    }
                });
                // initialize the global media list, if there was finished commenting.
                if(countOfMediaList == 0) {
                    gMediaIdList = [];
                }

                // reset start comment time for interval.
                gStartCommentTime = crrCommentServerTime;
            }
        } else {
            if(countOfFilters > 0) {
                // Get media list by hashtag from instagram.
                BotService.getMediaIdByHashTag(gSession, hashtag, function(mediaData) {
                    // if there is not hashtag on instagram, change the hashtag.
                    if(mediaData.is_challenge == false) {
                        if(mediaData.flag == false) {
                            countOfFilters--;

                            hashtag = arrFilter[countOfFilters].hashtag;
                        // if there is hashtag on instagram, push to global media list.    
                        } else {
                            for(var obj of mediaData.data) {
                                gMediaIdList.push(obj);
                            }
                        }
                    } else {
                        console.log(mediaData);
                        // challenge 
                        process.send({
                            type: 5,
                            flag: true,
                            botId:botId,
                            message: mediaData.data
                        })
                    }
                });
            }
        }

        /**
         * @description
         * direct message logic
         */
        var currDirectMessageTime = (new Date()).getTime(); // milisecond
        if(currDirectMessageTime - gStartDirectMessageTime > parseInt(messageDelay) * 1000) {
            // Get messages from database.
            BotService.getInboxById(gSession, function(inbox) {
                if(inbox.flag == true) {
                    if(inbox.data.length > 0) {
                        var countOfInbox = inbox.data.length;

                        async function asyncDMToClientById() {
                            countOfInbox--;

                            var clientId = inbox.data[countOfInbox].clientId;
                            var clientText = inbox.data[countOfInbox].text;

                            // Get count of reply histories by bot ID.
                            BotService.getCountOfReplyHistoriesById(botId, clientId, function(countReplyHistories) {
                                /**
                                 * @description
                                 * How to make the text one by one.
                                 * 
                                 * 1. Get count of reply text from history.
                                 * 2. Current reply list and count.
                                 */

                                if(countReplyHistories > 0) {
                                    var replyIndex = countReplyHistories;
                                    var replyText = arrReply[replyIndex].text;
                                    var replyId = arrReply[replyIndex].id;
                                } else {
                                    var replyIndex = 0;
                                    var replyText = arrReply[replyIndex].text;
                                    var replyId =  arrReply[replyIndex].id;
                                }

                                if( arrReply.length >= countReplyHistories) { // if already sent all messages
                                    if(parseInt(clientId) > 0 && clientText) {
                                        // Direct message to client with client id using reply messages.
                                        BotService.directMessageToClient(gSession, clientId, replyText, function(resultOfDM) {
                                            if(resultOfDM.flag == true) {
                                                var replyHistoryData = {
                                                    bot_id: botId,
                                                    client_id: clientId,
                                                    client_name: resultOfDM.data.name,
                                                    client_image_url: resultOfDM.data.imgUrl,
                                                    client_text: clientText,
                                                    is_manual: 'N',
                                                    manual_reply_text: null,
                                                    reply_id: replyId
                                                }
    
                                                // Save all history to database.
                                                BotService.saveReplyHistory(replyHistoryData, function(saveReplyHistoryCB) {
                                                    if(saveReplyHistoryCB.flag == true) {
                                                        console.log('Success save reply history '+botId);                                                            
                                                    }
                                                });
                                            } else {
                                                // Challenge => direct message to client.
                                                process.send({
                                                    type: 5,
                                                    flag: true,
                                                    botId: botId,
                                                    message: resultOfDM.data
                                                })
                                            }
                                        });
                                    }
                                }
                            });

                            // Recorsive count of inbox.
                            if(countOfInbox > 0) {
                                asyncDMToClientById()
                            }
                        }

                        // excute the async function.
                        asyncDMToClientById();
                    }
                } else {
                    // Challenge =>  get Inbox by id
                }
                
            });

            gStartDirectMessageTime = currDirectMessageTime;
        }

        /**
         * @description
         * follow up message logic
         */
        var countOfFUM = arrFUM.length;
        var currFUMTime = (new Date()).getTime(); // milisecond.
        if(gIndexOfFUM < countOfFUM) {
            var fumStartTime = (new Date(arrFUM[gIndexOfFUM].start_date)).getTime(); // validate for fum
            if(currFUMTime > fumStartTime ) {
                BotService.getClientIdList(botId, function(arrClientList) {
                    var countOfArrClientList = arrClientList.length;

                    if(countOfArrClientList > 0) {
                        async function asyncSendFUMByClientId() {
                            countOfArrClientList --;
                            var fumClientId = arrClientList[countOfArrClientList];
                            var fumText = arrFUM[gIndexOfFUM].text;

                            BotService.directMessageToClient(gSession, fumClientId, fumText, function(response) {
                                if(response.flag == true) {
                                    var fumHistoryData = {
                                        bot_id: botId,
                                        fum_id: arrFUM[gIndexOfFUM].id,
                                        client_id: response.data.id
                                    }
    
                                    BotService.saveFUMHistory(fumHistoryData, function(cb) {
                                        if(cb.flag == true) {
                                            console.log("Successfully saved follow up message history data");
                                        } 
                                    });
                                } else {
                                    // Challenge => direct message to client 
                                    process.send({
                                        type: 5,
                                        flag: true,
                                        botId: botId,
                                        message: response.data
                                    })
                                }
                            });

                            if(countOfArrClientList > 0) {
                                asyncSendFUMByClientId();
                            }
                        }

                        asyncSendFUMByClientId();
                    }
                });
                // increase the follow up messager
                gIndexOfFUM =  gIndexOfFUM + 1;
            }
        }

        /**
         * @description
         * un-follow logic per day
         */
        var crrUnFollowTime = (new Date()).getTime(); // milisecond.
        if(crrUnFollowTime - gStartUnFollowTime > 86400000) {
            BotService.getFollowerList(botId, function(arrFollowerList) {
                var countOfFollowerList = arrFollowerList.length;

                async function asyncUnFollow() {
                    countOfFollowerList--;
                    var currFollowerTime = (new Date()).getTime();
                    var updateTime = (new Date(arrFollowerList[countOfFollowerList].createdAt)).getTime() + 172800000;

                    if(currFollowerTime >= updateTime) {
                        var followHistoryId = arrFollowerList[countOfFollowerList].id;
                        var followedClientId = arrFollowerList[countOfFollowerList].client_id;

                        // un-follow user by client id
                        BotService.unFollowUserbyId(gSession, followedClientId, function(unfollowCB) {
                            if(unfollowCB.flag == true) {
                                BotService.updateFollowStatus(followHistoryId, function(saveUnFollowCB) {
                                    if(saveUnFollowCB.flag == true) {
                                        console.log("Successfully updated follow state to unfollow");
                                    }
                                });
                            } else {
                                // Challenge => un-follow user by client id
                                process.send({
                                    type: 5,
                                    flag: true,
                                    botId: botId,
                                    message: unfollowCB.data
                                })
                            }
                        });
                    }

                    if(countOfFollowerList > 0) {
                        asyncUnFollow();
                    }
                }

                asyncUnFollow();
            });

            gStartUnFollowTime = crrUnFollowTime;
        }

        if(flagOfIsCreated == false) {
            process.send({
                type: 1,
                flag: true,
                botId: botId,
                message: 'Updated your bot'
            });

            flagOfIsCreated = true;
        }
    }
}, 3000);
/* ===================================================< End Create bot >=========================================================== */

setInterval(() => {
    // Updated bot controller part.
    if(initializeData.is_activated == 'Y' && initializeData.is_created == 'N' && initializeData.is_updated == 'Y') {

        if(flagOfIsUpdated == false) {
            process.send({
                type: 2,
                flag: true,
                botId: botId,
                message: 'Updated your bot'
            });

            flagOfIsUpdated = true;
        }
    }
}, 1000);

setInterval(() => {
    // Activated bot conroller part.
    if(initializeData.is_activated == 'Y' && initializeData.is_created == 'N' && initializeData.is_updated == 'N') {

        if(flagOfIsActivated == false) {
            process.send({
                type: 3,
                flag: true,
                botId: botId,
                message: 'Started your botsd'
            });

            flagOfIsActivated = true;
        }
    }
}, 1000);

setInterval(() => {
    // Deactivated bot controller part.
    if(initializeData.is_activated == 'N' && initializeData.is_created == 'N' && initializeData.is_updated == 'N') {
        var botId = initializeData.bot_id;

        if(flagOfIsDeactivated == false) {
            process.send({
                type: 4,
                flag: true,
                botId: botId,
                message: 'Paused your bot'
            });

            flagOfIsDeactivated = true;
        }
    }
}, 1000);

 // Standard bot functions
 /**
 * @description
 * Get object size from validated object.
 * 
 * @param {OBJECT} obj 
 */
function getObjectSize(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

/**
 * @description
 * Return Random integer within max values.
 * 
 * @param {INTEGER} count 
 */
function getRandomInt(count) {
    var random = Math.floor(Math.random() * Math.floor(count));

    return random;
}