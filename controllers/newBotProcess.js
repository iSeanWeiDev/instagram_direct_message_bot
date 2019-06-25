// new instagram bot.
'use strict';

var BotService = require('../services/botService');
process.on('message', function(data) {
    console.log(data);
    if(data.flag == true) {
        var botId = data.bot.id;
        var accountName = data.bot.account_name;
        var accountPass = data.bot.account_password;
        var messageDelay = data.bot.message_delay;
        var maxComment = data.bot.max_comment;
        var proxyUrl = data.proxy.proxy_url;
        var arrFilter = data.filters;
        var arrComment = data.comments;
        var arrReply = data.replies;
        var arrFUM = data.fums;

        // Validate user info for create bot.
        BotService.validateBot(accountName, accountPass, proxyUrl, function(result) {
            if(result.flag == true) {
                var gSession = result.session;
                // var gMediaIdList = [];
                
                /**
                 * @description
                 * Comment by filter logic
                 */
                // var startCommentTime = 0;
                // var countOfFilters = arrFilter.length - 1;
                // var miliDay = 1000 * 60 * 60 * 24;// milisecond
                // var deltaCommentTime = parseInt(miliDay/maxComment);
                // var hashtag = arrFilter[countOfFilters].hashtag;
                
                // setInterval(() => {
                //     var crrCommentServerTime = (new Date()).getTime(); // milisecond

                //     if(gMediaIdList.length > 0 && arrComment.length > 0) {
                //         var countOfMediaList = gMediaIdList.length;
                        
                //         if(crrCommentServerTime - startCommentTime > deltaCommentTime) {
                //             countOfMediaList --;
                //             var mediaId = gMediaIdList[countOfMediaList];
                //             var indexOfComment = getRandomInt(arrComment.length); 
                //             var commentText = arrComment[indexOfComment].text;
                //             var commentId = arrComment[indexOfComment].id;
                            
                //             BotService.commitByMediaId(gSession, mediaId, commentText, function(resultOfCommit) {
                //                 if(resultOfCommit.flag == true) {
                //                     var commitHistoryData = {
                //                         bot_id: botId,
                //                         filter_id: arrFilter[countOfFilters].id,
                //                         media_id: mediaId,
                //                         comment_id: commentId
                //                     }

                //                     BotService.saveCommitHistory(commitHistoryData, function(saveCommitHistoryData) {
                //                         console.log("comment successed " + commitHistoryData);
                //                     })
                //                 }
                //             });

                //             if(countOfMediaList == 0) {
                //                 gMediaIdList = [];
                //             }

                //             startCommentTime = crrCommentServerTime;
                //         } 
                //     } else {
                //         if(countOfFilters >= 0) {
                //             BotService.getMediaIdByHashTag(gSession, hashtag, function(mediaData) {
                //                 if(mediaData.flag == false) {
                //                     countOfFilters--;

                //                     hashtag = arrFilter[countOfFilters].hashtag;
                //                 } else {
                //                     for(var obj of mediaData.data) {
                //                         gMediaIdList.push(obj);
                //                     }
                //                 }
                //             });
                //         }
                //     }
                // }, 1000);

                /**
                 * @description
                 * direct message logic
                 */
                // var startDirectMessageTime = 0;
                // setInterval(() => {
                //     var currDirectMessageTime = (new Date()).getTime(); // milisecond

                //     if(currDirectMessageTime - startDirectMessageTime > parseInt(messageDelay) * 1000){
                //         // Get messages from database.
                //         BotService.getInboxById(gSession, function(inbox) {
                //             if(inbox.length > 0) {
                //                 var countOfInbox = inbox.length;

                //                 async function asyncDMToClientById() {
                //                     countOfInbox--;

                //                     var clientId = inbox[countOfInbox].clientId;
                //                     var clientText = inbox[countOfInbox].text;

                //                     // Get count of reply histories by bot ID.
                //                     BotService.getCountOfReplyHistoriesById(botId, clientId, function(countReplyHistories) {
                //                         /**
                //                          * @description
                //                          * How to make the text one by one.
                //                          * 
                //                          * 1. Get count of reply text from history.
                //                          * 2. Current reply list and count.
                //                          */
                //                         if(countReplyHistories > 0) {
                //                             var replyIndex = countReplyHistories;
                //                             var replyText = arrReply[replyIndex].text;
                //                             var replyId = arrReply[replyIndex].id;
                //                         } else {
                //                             var replyIndex = 0;
                //                             var replyText = arrReply[replyIndex].text;
                //                             var replyId =  arrReply[replyIndex].id;
                //                         }

                //                         if(countReplyHistories < arrReply.length) { // if already send all messages
                //                             if(parseInt(clientId) > 0 && clientText) {
                //                                 // Direct message to client with client id using reply messages.
                //                                 BotService.directMessageToClient(gSession, clientId, replyText, function(resultOfDM) {
                //                                     var replyHistoryData = {
                //                                         bot_id: botId,
                //                                         client_id: clientId,
                //                                         client_name: resultOfDM.name,
                //                                         client_image_url: resultOfDM.imgUrl,
                //                                         client_text: clientText,
                //                                         is_manual: 'N',
                //                                         manual_reply_text: null,
                //                                         reply_id: replyId
                //                                     }

                //                                     // Save all history to database.
                //                                     BotService.saveReplyHistory(replyHistoryData, function(response) {
                //                                         console.log(response);
                //                                     });
                //                                 });
                //                             }
                //                         }

                //                     });

                //                     // Recorsive count of inbox.
                //                     if(countOfInbox > 0) {
                //                         asyncDMToClientById()
                //                     }
                //                 }

                //                 asyncDMToClientById();
                //             }
                //         });
                        
                //         startDirectMessageTime = currDirectMessageTime;
                //     }
                // }, 1000);

                /**
                 * @description
                 * follow up message logic
                 */
                var startFUMTime = 0;
                var countOfFUM = arrFUM.length;
                var IndexOfFUM = 0;
               

                setInterval(() => {
                    var currFUMTime = (new Date()).getTime(); // milisecond.
                    var fumStartTime = (new Date(arrFUM[IndexOfFUM].start_date)).getTime();

                    if(currFUMTime > fumStartTime && IndexOfFUM < countOfFUM) {
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
                                            client_id: arrClientList[countOfArrClientList]
                                        }
        
                                        BotService.saveFUMHistory(fumHistoryData, function(cb) {
                                            console.log(cb);
                                        });
                                    });
        
                                    if(countOfArrClientList >= 0) {
                                        asyncSendFUMByClientId();
                                    }
                                }
        
                                asyncSendFUMByClientId();
                            }
                        });

                        IndexOfFUM =  IndexOfFUM + 1;
                    }
                    
                }, 1000);

                 /**
                 * @description
                 * un-follow logic
                 */
                setInterval(() => {
                    
                }, 1000);

                 /**
                 * @description
                 * schedule logic
                 */
                setInterval(() => {
                    
                }, 1000);
            } else {

            }
        });
    }

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
});