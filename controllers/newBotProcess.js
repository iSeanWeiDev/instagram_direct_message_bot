// new instagram bot.
'use strict';

// Import service for manage bot.
var BotService = require('../services/botService');
var initializeData = {};
var gSession = {};
var gMediaIdList = [];
var gStartCommentTime = 0; // initialize the start time for comment
var gStartDirectMessageTime = 0; // initialize the start time for direct message
var gStartUnFollowTime = (new Date()).getTime(); // initialize the start time for un-folow.
var gIndexOfFUM = 0;


var flagOfIsCreated = true;
var flagOfIsUpdated = true;
var flagOfIsActivated = true;

// Receive data using "message" method from parent process.
process.on('message', function(data) {
    initializeData = data;
    if(data.is_activated == 'Y' && data.is_created == 'Y' && data.is_updated == 'N') {
        var accountName = initializeData.bot.account_name;
        var accountPass = initializeData.bot.account_password;
        var proxyUrl = initializeData.proxy.proxy_url;

        BotService.validateBot(accountName, accountPass, proxyUrl, function(result) {
            if(result.flag == true) {
                gSession = result.session;
            } else {
                process.send({
                    type: 1,
                    flag: false,
                    error: result.type
                });
            }
        });
    }

    if(data.is_activated == 'Y' && data.is_created == 'N' && data.is_updated == 'Y') {
        var accountName = initializeData.bot.account_name;
        var accountPass = initializeData.bot.account_password;
        var proxyUrl = initializeData.proxy.proxy_url;

        BotService.validateBot(accountName, accountPass, proxyUrl, function(result) {
            if(result.flag == true) {
                gSession = result.session;
            } else {
                process.send({
                    type: 2,
                    flag: false,
                    error: result.type
                });
            }
        });
    }

    if(data.is_activated == 'Y' && data.is_created == 'N' && data.is_updated == 'N') {
        var accountName = initializeData.bot.account_name;
        var accountPass = initializeData.bot.account_password;
        var proxyUrl = initializeData.proxy.proxy_url;

        BotService.validateBot(accountName, accountPass, proxyUrl, function(result) {
            if(result.flag == true) {
                gSession = result.session;
            } else {
                process.send({
                    type: 3,
                    flag: false,
                    error: result.type
                });
            }
        });
    }
});

/**
 * process.send(1) : create bot
 * process.send(2) : updated bot
 * process.send(3) : changed status: activated
 * process.send(4) : changed status: disactivated
 */

setInterval(() => {
    if(getObjectSize(gSession) > 0) {
        // created bot && activated bot
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
            var countOfFilters = arrFilter.length - 1;
            var miliDay = 1000 * 60 * 60 * 24;// milisecond
            var deltaCommentTime = parseInt(miliDay/maxComment);
            var hashtag = arrFilter[countOfFilters].hashtag;
            var crrCommentServerTime = (new Date()).getTime(); // milisecond

            /**
             * @description
             * Comment by filter logic
             */
            if(gMediaIdList.length > 0 && arrComment.length > 0) {
                if(crrCommentServerTime - gStartCommentTime > deltaCommentTime) {
                    var countOfMediaList = gMediaIdList.length;
                    
                    countOfMediaList --;

                    var mediaId = gMediaIdList[countOfMediaList].mediaId;
                    var followClientId = gMediaIdList[countOfMediaList].clientId;
                    var indexOfComment = getRandomInt(arrComment.length - 1); 
                    var commentText = arrComment[indexOfComment].text;
                    var commentId = arrComment[indexOfComment].id;

                    // comment to post by media id.
                    BotService.commitByMediaId(gSession, mediaId, commentText, function(resultOfCommit) {
                        if(resultOfCommit.flag == true) {
                            var commitHistoryData = {
                                bot_id: botId,
                                filter_id: arrFilter[countOfFilters].id,
                                media_id: mediaId,
                                comment_id: commentId
                            }
                            
                            // save the comment history for next step.
                            BotService.saveCommitHistory(commitHistoryData, function(saveCommitHistoryData) {
                                console.log("comment successed " + saveCommitHistoryData);
                            });

                            // follow users by client id.
                            BotService.followUserById(gSession, followClientId, function(followCB) {
                                if(followCB.data.outgoing_request == true) {
                                    var followHistoryData = {
                                        bot_id: botId,
                                        client_id: followClientId,
                                        is_follow: 'Y'
                                    }

                                    // save follower history to database.
                                    BotService.saveFollowUserHistory(followHistoryData, function(historyCB) {
                                        console.log(historyCB);
                                    });
                                }
                            });
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
                        if(mediaData.flag == false) {
                            countOfFilters--;

                            hashtag = arrFilter[countOfFilters].hashtag;

                        // if there is hashtag on instagram, push to global media list.    
                        } else {
                            for(var obj of mediaData.data) {
                                gMediaIdList.push(obj);
                            }
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
                    if(inbox.length > 0) {
                        var countOfInbox = inbox.length;

                        async function asyncDMToClientById() {
                            countOfInbox--;

                            var clientId = inbox[countOfInbox].clientId;
                            var clientText = inbox[countOfInbox].text;

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
                                            var replyHistoryData = {
                                                bot_id: botId,
                                                client_id: clientId,
                                                client_name: resultOfDM.name,
                                                client_image_url: resultOfDM.imgUrl,
                                                client_text: clientText,
                                                is_manual: 'N',
                                                manual_reply_text: null,
                                                reply_id: replyId
                                            }

                                            // Save all history to database.
                                            BotService.saveReplyHistory(replyHistoryData, function(response) {
                                                console.log(response);
                                            });
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
                var fumStartTime = (new Date(arrFUM[gIndexOfFUM].start_date)).getTime();
                if(currFUMTime > fumStartTime ) {
                    BotService.getClientIdList(botId, function(arrClientList) {
                        var countOfArrClientList = arrClientList.length;
    
                        if(countOfArrClientList > 0) {
                            async function asyncSendFUMByClientId() {
                                countOfArrClientList --;
                                var fumClientId = arrClientList[countOfArrClientList];
                                var fumText = arrFUM[gIndexOfFUM].text;
    
                                BotService.directMessageToClient(gSession, fumClientId, fumText, function(response) {
                                    var fumHistoryData = {
                                        bot_id: botId,
                                        fum_id: arrFUM[gIndexOfFUM].id,
                                        client_id: response.id
                                    }
    
                                    BotService.saveFUMHistory(fumHistoryData, function(cb) {
                                        console.log(cb);
                                    });
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
                            BotService.unFollowUserbyId(followHistoryId, function(unFollowCB) {

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
                
            // Re-set the bot create send function to parent process.
            if(flagOfIsCreated == true) {
                process.send({
                    type: 1,
                    flag: true
                });

                flagOfIsCreated = false;
            } 
        }
        // updated bot && activated bot
        if(initializeData.is_activated == 'Y' && initializeData.is_created == 'N' && initializeData.is_updated == 'Y') {
            // Global initialized values from server.
            var botId = initializeData.bot.id;
            var messageDelay = initializeData.bot.message_delay;
            var maxComment = initializeData.bot.max_comment;
            var arrFilter = initializeData.filters;
            var arrComment = initializeData.comments;
            var arrReply = initializeData.replies;
            var arrFUM = initializeData.fums;

            // Global comment values.
            var countOfFilters = arrFilter.length - 1;
            var miliDay = 1000 * 60 * 60 * 24;// milisecond
            var deltaCommentTime = parseInt(miliDay/maxComment);
            var hashtag = arrFilter[countOfFilters].hashtag;
            var crrCommentServerTime = (new Date()).getTime(); // milisecond

            /**
             * @description
             * Comment by filter logic
             */
            if(gMediaIdList.length > 0 && arrComment.length > 0) {
                if(crrCommentServerTime - gStartCommentTime > deltaCommentTime) {
                    var countOfMediaList = gMediaIdList.length;
                    
                    countOfMediaList --;

                    var mediaId = gMediaIdList[countOfMediaList].mediaId;
                    var followClientId = gMediaIdList[countOfMediaList].clientId;
                    var indexOfComment = getRandomInt(arrComment.length - 1); 
                    var commentText = arrComment[indexOfComment].text;
                    var commentId = arrComment[indexOfComment].id;

                    // comment to post by media id.
                    BotService.commitByMediaId(gSession, mediaId, commentText, function(resultOfCommit) {
                        if(resultOfCommit.flag == true) {
                            var commitHistoryData = {
                                bot_id: botId,
                                filter_id: arrFilter[countOfFilters].id,
                                media_id: mediaId,
                                comment_id: commentId
                            }
                            
                            // save the comment history for next step.
                            BotService.saveCommitHistory(commitHistoryData, function(saveCommitHistoryData) {
                                console.log("comment successed " + saveCommitHistoryData);
                            });

                            // follow users by client id.
                            BotService.followUserById(gSession, followClientId, function(followCB) {
                                console.log(followCB);
                                if(followCB.data == true) {
                                    var followHistoryData = {
                                        bot_id: botId,
                                        client_id: followClientId,
                                        is_follow: 'Y'
                                    }

                                    // save follower history to database.
                                    BotService.saveFollowUserHistory(followHistoryData, function(historyCB) {
                                        console.log(historyCB);
                                    });
                                }
                            });
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
                        if(mediaData.flag == false) {
                            countOfFilters--;

                            hashtag = arrFilter[countOfFilters].hashtag;

                        // if there is hashtag on instagram, push to global media list.    
                        } else {
                            for(var obj of mediaData.data) {
                                gMediaIdList.push(obj);
                            }
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
                    if(inbox.length > 0) {
                        var countOfInbox = inbox.length;

                        async function asyncDMToClientById() {
                            countOfInbox--;

                            var clientId = inbox[countOfInbox].clientId;
                            var clientText = inbox[countOfInbox].text;

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
                                            var replyHistoryData = {
                                                bot_id: botId,
                                                client_id: clientId,
                                                client_name: resultOfDM.name,
                                                client_image_url: resultOfDM.imgUrl,
                                                client_text: clientText,
                                                is_manual: 'N',
                                                manual_reply_text: null,
                                                reply_id: replyId
                                            }

                                            // Save all history to database.
                                            BotService.saveReplyHistory(replyHistoryData, function(response) {
                                                console.log(response);
                                            });
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
                var fumStartTime = (new Date(arrFUM[gIndexOfFUM].start_date)).getTime();
                if(currFUMTime > fumStartTime) {
                    BotService.getClientIdList(botId, function(arrClientList) {
                        var countOfArrClientList = arrClientList.length;
    
                        if(countOfArrClientList > 0) {
                            async function asyncSendFUMByClientId() {
                                countOfArrClientList --;
                                var fumClientId = arrClientList[countOfArrClientList];
                                var fumText = arrFUM[IndexOfFUM].text;
    
                                BotService.directMessageToClient(gSession, fumClientId, fumText, function(response) {
                                    var fumHistoryData = {
                                        bot_id: botId,
                                        fum_id: arrFUM[IndexOfFUM].id,
                                        client_id: response.id
                                    }
    
                                    BotService.saveFUMHistory(fumHistoryData, function(cb) {
                                        console.log(cb);
                                    });
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
                            BotService.unFollowUserbyId(followHistoryId, function(unFollowCB) {

                            });
                        }

                        if(countOfFollowerList > 0) {
                            asyncUnFollow();
                        }
                    }

                    asyncUnFollow();
                });
            }
                
            // Re-set the bot create send function to parent process.
            if(flagOfIsUpdated == true) {
                process.send({
                    type: 2,
                    flag: true
                });

                flagOfIsUpdated = false;
            } 

            // if(flagOfIsUpdated == true) {
            //     process.send(2);
            //     flagOfIsUpdated = false;
            // }
        }

        // changed status && activated bot
        if(initializeData.is_activated == 'Y' && initializeData.is_created == 'N' && initializeData.is_updated == 'N') {
            // Global initialized values from server.
            var botId = initializeData.bot.id;
            var messageDelay = initializeData.bot.message_delay;
            var maxComment = initializeData.bot.max_comment;
            var arrFilter = initializeData.filters;
            var arrComment = initializeData.comments;
            var arrReply = initializeData.replies;
            var arrFUM = initializeData.fums;

            // Global comment values.
            var countOfFilters = arrFilter.length - 1;
            var miliDay = 1000 * 60 * 60 * 24;// milisecond
            var deltaCommentTime = parseInt(miliDay/maxComment);
            var hashtag = arrFilter[countOfFilters].hashtag;
            var crrCommentServerTime = (new Date()).getTime(); // milisecond

            /**
             * @description
             * Comment by filter logic
             */
            if(gMediaIdList.length > 0 && arrComment.length > 0) {
                if(crrCommentServerTime - gStartCommentTime > deltaCommentTime) {
                    var countOfMediaList = gMediaIdList.length;
                    
                    countOfMediaList --;

                    var mediaId = gMediaIdList[countOfMediaList].mediaId;
                    var followClientId = gMediaIdList[countOfMediaList].clientId;
                    var indexOfComment = getRandomInt(arrComment.length - 1); 
                    var commentText = arrComment[indexOfComment].text;
                    var commentId = arrComment[indexOfComment].id;

                    // comment to post by media id.
                    BotService.commitByMediaId(gSession, mediaId, commentText, function(resultOfCommit) {
                        if(resultOfCommit.flag == true) {
                            var commitHistoryData = {
                                bot_id: botId,
                                filter_id: arrFilter[countOfFilters].id,
                                media_id: mediaId,
                                comment_id: commentId
                            }
                            
                            // save the comment history for next step.
                            BotService.saveCommitHistory(commitHistoryData, function(saveCommitHistoryData) {
                                console.log("comment successed " + saveCommitHistoryData);
                            });

                            // follow users by client id.
                            BotService.followUserById(gSession, followClientId, function(followCB) {
                                console.log(followCB);
                                if(followCB.data == true) {
                                    var followHistoryData = {
                                        bot_id: botId,
                                        client_id: followClientId,
                                        is_follow: 'Y'
                                    }

                                    // save follower history to database.
                                    BotService.saveFollowUserHistory(followHistoryData, function(historyCB) {
                                        console.log(historyCB);
                                    });
                                }
                            });
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
                        if(mediaData.flag == false) {
                            countOfFilters--;

                            hashtag = arrFilter[countOfFilters].hashtag;

                        // if there is hashtag on instagram, push to global media list.    
                        } else {
                            for(var obj of mediaData.data) {
                                gMediaIdList.push(obj);
                            }
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
                    if(inbox.length > 0) {
                        var countOfInbox = inbox.length;

                        async function asyncDMToClientById() {
                            countOfInbox--;

                            var clientId = inbox[countOfInbox].clientId;
                            var clientText = inbox[countOfInbox].text;

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
                                            var replyHistoryData = {
                                                bot_id: botId,
                                                client_id: clientId,
                                                client_name: resultOfDM.name,
                                                client_image_url: resultOfDM.imgUrl,
                                                client_text: clientText,
                                                is_manual: 'N',
                                                manual_reply_text: null,
                                                reply_id: replyId
                                            }

                                            // Save all history to database.
                                            BotService.saveReplyHistory(replyHistoryData, function(response) {
                                                console.log(response);
                                            });
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

                var fumStartTime = (new Date(arrFUM[gIndexOfFUM].start_date)).getTime();

                if(currFUMTime > fumStartTime ) {
                    BotService.getClientIdList(botId, function(arrClientList) {
                        var countOfArrClientList = arrClientList.length;
    
                        if(countOfArrClientList > 0) {
                            async function asyncSendFUMByClientId() {
                                countOfArrClientList --;
                                var fumClientId = arrClientList[countOfArrClientList];
                                var fumText = arrFUM[IndexOfFUM].text;
    
                                BotService.directMessageToClient(gSession, fumClientId, fumText, function(response) {
                                    var fumHistoryData = {
                                        bot_id: botId,
                                        fum_id: arrFUM[IndexOfFUM].id,
                                        client_id: response.id
                                    }
    
                                    BotService.saveFUMHistory(fumHistoryData, function(cb) {
                                        console.log(cb);
                                    });
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
                            BotService.unFollowUserbyId(followHistoryId, function(unFollowCB) {

                            });
                        }

                        if(countOfFollowerList > 0) {
                            asyncUnFollow();
                        }
                    }

                    asyncUnFollow();
                });
            }

            if(flagOfIsActivated == true) {
                process.send({
                    type: 3,
                    flag: true
                });

                flagOfIsActivated = false;
            }
        }

        // changed status && dis-activated bot.
        if(initializeData.is_activated == 'N' && initializeData.is_created == 'N' && initializeData.is_updated == 'N') {
            if(flagOfIsActivated == false) {
                process.send({
                    type: 4,
                    flag: true
                });
                flagOfIsActivated = true;
            }
        }
     }
 }, 10000);

/**
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
    var random = Math.floor(Math.random() * Math.floor(count) + 1);

    return random;
}