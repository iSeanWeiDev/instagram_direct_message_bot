// new instagram bot.
'use strict';
// Import service for manage bot.
var BotService = require('../services/botService');

var initializeData = {};
var gGlobalIntervalTime = 8000; // milisecond
var gSession = {};
var gMediaIdList = []; // initialize the global media list.
var gStartCommentTime = 0; // initialize the start time for comment
var gStartFollowTime = 0; // initialize the start time for comment
var gStartDirectMessageTime = 0; // initialize the start time for direct message.
var gIndexOfFUM = 0; //follow up message list index.
var gStartUnFollowTime = (new Date()).getTime(); // initialize the start time for un-follow.

// Global flags
var flagOfIsCreated = true;
var flagOfIsActivated = true;
var flagOfIsDeactivated = true;
var flagOfFilter = true;
var initCountOfMediaList = 0;
var indexOfFilter = 0;

// Receive data using "message" method from parent process.
process.on('message', function(data) {
    // Initialize the bot data before get new data from Parent Process.
    gSession = {};
    initializeData = data;

    // Initialize the global session when we get the created bot
    if(data.is_activated == 'Y' && data.is_created == 'Y') {
        var accountName = data.bot.account_name;
        var accountPass = data.bot.account_password;
        var proxyUrl = data.proxy.proxy_url;

        BotService.validateBot(accountName, accountPass, proxyUrl, function(result) {
            if(result.flag == true) {
                // initialize the global session.
                gSession = result.session;
                // make flag "Create" false.
                flagOfIsCreated = true;
                flagOfFilter = true;
            } else {
                process.send({
                    type: 1,
                    flag: false,
                    error: result.type
                });
            }
        });
    }

    // Initialize the global session when we get the Activated bot
    if(data.is_activated == 'Y' && data.is_created == 'N') {
        gSession = {};
        var accountName = data.bot.account_name;
        var accountPass = data.bot.account_password;
        var proxyUrl = data.proxy.proxy_url;

        BotService.validateBot(accountName, accountPass, proxyUrl, function(result) {
            if(result.flag == true) {
                // initialize the global session.
                gSession = result.session;
                // make flag "Activate" false.
                flagOfIsActivated = true;
                flagOfFilter = true;
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
    if(data.is_activated == 'N' && data.is_created == 'N') {
        // make flag "Deactivate" false.
        gSession = {};
        flagOfIsDeactivated = true;
    }
});

/**
 * process.send(1) : create bot
 * process.send(2) : updated bot // ignored.
 * process.send(3) : changed status: activated
 * process.send(4) : changed status: disactivated
 * process.send(5) : challenge required
 */

/* ===================================================< Begin Create bot >=========================================================== */
setInterval(() => {
    if(getObjectSize(gSession) > 0) {
        // Created bot controller part.
        if(initializeData.is_activated == 'Y' && initializeData.is_created == 'Y' ) {
            // Global initialized values from server.
            var botId = initializeData.bot.id;
            var messageDelay = initializeData.bot.message_delay;
            var maxComment = initializeData.bot.max_comment;
            var maxFollow = parseInt(maxComment) * 12;
            var arrFilter = initializeData.filters;
            var arrComment = initializeData.comments;
            var arrReply = initializeData.replies;
            var arrFUM = initializeData.fums;

            /*=======================================/
            /============ Commenting ================/
            /=======================================*/

            // Global comment values.
            var countOfFilters = arrFilter.length;
            var miliDay = 1000 * 60 * 60 * 24;// milisecond
            var deltaCommentTime = parseInt(miliDay/maxComment);
            var deltaFollowTime = parseInt(miliDay/maxFollow);
            
            var crrCommentServerTime = (new Date()).getTime(); // milisecond.

            if(gMediaIdList.length > 0) {
                if(crrCommentServerTime - gStartCommentTime > deltaCommentTime) {
                    initCountOfMediaList++;

                    var countOfMediaList = gMediaIdList.length;
                    countOfMediaList = countOfMediaList - initCountOfMediaList;

                    var mediaId = gMediaIdList[countOfMediaList].mediaId;
                    var followClientId = gMediaIdList[countOfMediaList].clientId;
                    var indexOfComment = getRandomInt(arrComment.length); 
                    var commentText = arrComment[indexOfComment].text;
                    var commentId = arrComment[indexOfComment].id;
                    
                    // Don't make comment duplicated media id again.
                    //BotService.getHistoryMediaIdList();

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
                                    console.log("Comment successed" + botId);
                                }
                            });

                            // follow users by client id.
                            // add follow logic with maxFollow
                            if(crrCommentServerTime - gStartFollowTime > deltaFollowTime) {
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
                                        });

                                        gMediaIdList = [];
                                    }
                                });
                                gStartFollowTime = crrCommentServerTime
                            }
                        } else {
                            // Challenge => commit by media id.
                            process.send({
                                type: 5,
                                flag: true,
                                botId:botId,
                                message: resultOfCommit.data
                            });

                            gMediaIdList = [];
                        }
                    });

                    gStartCommentTime = crrCommentServerTime;
                }
            } else {
                // get media List by filter
                if(countOfFilters > 0 && countOfFilters > indexOfFilter) {
                    var hashtag = arrFilter[indexOfFilter].hashtag;

                    BotService.getMediaIdByHashTag(gSession, hashtag, function(mediaData) {
                        if(mediaData.is_challenge == true) {
                            // challenge for getting media list from Instagram.
                            if(flagOfFilter == true) {
                                process.send({
                                    type: 5,
                                    flag: true,
                                    botId:botId,
                                    message: mediaData.data
                                });
                                
                                gMediaIdList = [];
                                flagOfFilter = false;
                            }
                        } else {
                            if(mediaData.flag == true) {
                                for(var obj of mediaData.data) {
                                    gMediaIdList.push(obj);
                                }

                                indexOfFilter++;
                            } else {
                                // make another hashtag;
                                gMediaIdList = [];
                                indexOfFilter++;
                            }
                        }
                    });
                } else {
                    // challenge for getting media list from Instagram.
                    if(flagOfFilter == true) {
                        process.send({
                            type: 5,
                            flag: true,
                            botId:botId,
                            message: 'NoFilterError'
                        });

                        flagOfFilter = false;
                    }
                }
            }


            /*=======================================/
            /============ Direct message ============/
            /=======================================*/
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
                        } else {

                        }
                    } else {
                        // Challenge =>  get Inbox by id
                        process.send({
                            type: 5,
                            flag: true,
                            botId: botId,
                            message: inbox.data
                        })
                    }
                });

                gStartDirectMessageTime = currDirectMessageTime;
            }

            /*=======================================/
            /=========== Follow up message ==========/
            /=======================================*/

            var currFUMTime = (new Date()).getTime(); // milisecond.
            var newFUMList = [];

            for(var obj of arrFUM) {
                if((new Date(obj.start_date)).getTime() > currFUMTime) {
                    var objNewList = {
                        isSent: false,
                        data: obj
                    }
                    newFUMList.push(objNewList);
                }
            }
            
            if(newFUMList.length > 0) {
                if(newFUMList[0].isSent == false && currFUMTime > (new Date(newFUMList[0].data.start_date)).getTime()) {
                    BotService.getClientIdList(botId, function(arrClientList) {
                        var countOfArrClientList = arrClientList.length;

                        if(countOfArrClientList > 0) {
                            async function asyncSendFUMByClientId() {
                                countOfArrClientList --;
                                var fumClientId = arrClientList[countOfArrClientList];
                                var fumText = newFUMList[0].data.text;

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
                
                    newFUMList.data[0].isSent = true;
                }
            }

            /*=======================================/
            /===========   Unfollow users  ==========/
            /=======================================*/
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

            // send the created bot!
            if(flagOfIsCreated == true) {
                process.send({
                    type: 1, // created bot reply to parent process.
                    flag: true, // really
                    botId: botId, // bot id.
                    message: 'Updated your bot'
                });

                flagOfIsCreated = false;
            }
        }
    }
}, gGlobalIntervalTime);
/* ===================================================< End Create bot   >=========================================================== */

/* ===================================================< Begin Start bot >=========================================================== */

setInterval(() => {
    if(getObjectSize(gSession) > 0) {
        // Activated bot conroller part.
        if(initializeData.is_activated == 'Y' && initializeData.is_created == 'N') {
            // Global initialized values from server.
            var botId = initializeData.bot.id;
            var messageDelay = initializeData.bot.message_delay;
            var maxComment = initializeData.bot.max_comment;
            var arrFilter = initializeData.filters;
            var arrComment = initializeData.comments;
            var arrReply = initializeData.replies;
            var arrFUM = initializeData.fums;

            /*=======================================/
            /============ Commenting ================/
            /=======================================*/

            // Global comment values.
            var countOfFilters = arrFilter.length;
            var miliDay = 1000 * 60 * 60 * 24;// milisecond
            var deltaCommentTime = parseInt(miliDay/maxComment);
            
            var crrCommentServerTime = (new Date()).getTime(); // milisecond.

            if(gMediaIdList.length > 0) {
                if(crrCommentServerTime - gStartCommentTime > deltaCommentTime) {
                    initCountOfMediaList++;

                    var countOfMediaList = gMediaIdList.length;
                    countOfMediaList = countOfMediaList - initCountOfMediaList;

                    var mediaId = gMediaIdList[countOfMediaList].mediaId;
                    var followClientId = gMediaIdList[countOfMediaList].clientId;
                    var indexOfComment = getRandomInt(arrComment.length); 
                    var commentText = arrComment[indexOfComment].text;
                    var commentId = arrComment[indexOfComment].id;   
                    
                    // Don't make comment duplicated media id again.
                    //BotService.getHistoryMediaIdList();

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
                                    console.log("Comment successed" + botId);
                                }
                            });

                            // follow users by client id.
                            // follow users by client id.
                            // add follow logic with maxFollow
                            if(crrCommentServerTime - gStartFollowTime > deltaFollowTime) {
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
                                        });

                                        gMediaIdList = [];
                                    }
                                });
                                
                                gStartFollowTime = crrCommentServerTime
                            }

                        } else {
                            // Challenge => commit by media id.
                            process.send({
                                type: 5,
                                flag: true,
                                botId:botId,
                                message: resultOfCommit.data
                            });

                            gMediaIdList = [];
                        }
                    });

                    gStartCommentTime = crrCommentServerTime;
                }
            } else {
                // get media List by filter
                if(countOfFilters > 0 && countOfFilters > indexOfFilter) {
                    var hashtag = arrFilter[indexOfFilter].hashtag;

                    BotService.getMediaIdByHashTag(gSession, hashtag, function(mediaData) {
                        if(mediaData.is_challenge == true) {
                            // challenge for getting media list from Instagram.
                            if(flagOfFilter == true) {
                                process.send({
                                    type: 5,
                                    flag: true,
                                    botId:botId,
                                    message: mediaData.data
                                });
                                
                                gMediaIdList = [];
                                flagOfFilter = false;
                            }
                        } else {
                            if(mediaData.flag == true) {
                                for(var obj of mediaData.data) {
                                    gMediaIdList.push(obj);
                                }

                                indexOfFilter++;
                            } else {
                                // make another hashtag;
                                gMediaIdList = [];
                                indexOfFilter++;
                            }
                        }
                    });
                } else {
                    // challenge for getting media list from Instagram.
                    if(flagOfFilter == true) {
                        process.send({
                            type: 5,
                            flag: true,
                            botId:botId,
                            message: 'No filters to get media list'
                        });

                        flagOfFilter = false;
                    }
                }
            }


            /*=======================================/
            /============ Direct message ============/
            /=======================================*/
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
                        } else {

                        }
                    } else {
                        // Challenge =>  get Inbox by id
                        process.send({
                            type: 5,
                            flag: true,
                            botId: botId,
                            message: inbox.data
                        })
                    }
                });

                gStartDirectMessageTime = currDirectMessageTime;
            }

            /*=======================================/
            /=========== Follow up message ==========/
            /=======================================*/

            var currFUMTime = (new Date()).getTime(); // milisecond.
            var newFUMList = [];

            for(var obj of arrFUM) {
                if((new Date(obj.start_date)).getTime() > currFUMTime) {
                    var objNewList = {
                        isSent: false,
                        data: obj
                    }
                    newFUMList.push(objNewList);
                }
            }
            
            if(newFUMList.length > 0) {
                if(newFUMList[0].isSent == false && currFUMTime > (new Date(newFUMList[0].data.start_date)).getTime()) {
                    BotService.getClientIdList(botId, function(arrClientList) {
                        var countOfArrClientList = arrClientList.length;

                        if(countOfArrClientList > 0) {
                            async function asyncSendFUMByClientId() {
                                countOfArrClientList --;
                                var fumClientId = arrClientList[countOfArrClientList];
                                var fumText = newFUMList[0].data.text;

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
                
                    newFUMList.data[0].isSent = true;
                }
            }

            /*=======================================/
            /===========   Unfollow users  ==========/
            /=======================================*/
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
    }
}, gGlobalIntervalTime);

/* ===================================================< End Start bot >=========================================================== */


/* ===================================================< Begin Pause bot  >=========================================================== */
setInterval(() => {
    // Deactivated bot controller part.
    if(initializeData.is_activated == 'N' && initializeData.is_created == 'N') {
        var botId = initializeData.bot_id;

        if(flagOfIsDeactivated == true) {
            process.send({
                type: 4,
                flag: true,
                botId: botId,
                message: 'Paused your bot'
            });

            flagOfIsDeactivated = false;
        }
    }
}, gGlobalIntervalTime);
/* ===================================================< End Pause bot    >=========================================================== */

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