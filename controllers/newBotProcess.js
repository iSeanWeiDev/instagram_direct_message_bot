// new instagram bot.
'use strict';

var BotService = require('../services/botService');

process.on('message', function(data) {
    // Initialize first Global variables.
    var botId = data.botId,
        name = data.name,
        password = data.password,
        delayTime = data.delayTime,
        maxCommentDaily = data.maxCommentDaily,
        filters = JSON.parse(data.filters);


    // Validate user info for create bot.
    BotService.validateBot(name, password, function(validateCB) {
        if(validateCB.flag == true) {
            var gSession = validateCB.session;

            /**
             * 
             * @description
             * Begin Direct message for realtime part
             * 
             * 1. define time variable to save start time.
             * 2. get currnet system time.
             * 3. calcuate current system time - start time.
             * 4. if ( delte time > setted delta time).
             * 5. execute followed logic.
             * 6. start time  =  current system time at end of this logic.
             */

            // Step 1:  define time variable to save start time.
            var startTime = 0; // Initialize the value with 0
            
            setInterval(() => {
                var crrTime = (new Date()).getTime(); // milisecond
                if(crrTime - startTime >= parseInt(delayTime) * 1000) {

                    // Find messages from clients with session.
                    BotService.getInboxById(gSession, function(inbox) {
                        if(inbox.length > 0) {
                            // Get messages from database.
                            BotService.getMessageById(botId, function(messages) {

                                var countOfInbox = inbox.length;

                                async function asyncDMToClientById() {
                                    countOfInbox--;
                                    var message = inbox[countOfInbox].message;
                                    var clientId = inbox[countOfInbox].clientId;

                                    // Get count of reply histories by bot ID.
                                    BotService.getCountOfReplyHistoriesById(botId, function(countReplyHistories) {
                                        /**
                                         * @description
                                         * How to make the messages one by one.
                                         * 
                                         * 1. Get count of reply messages from history.
                                         * 2. Current reply list and count.
                                         */

                                        if(countReplyHistories > 0) {
                                            var replyIndex = countReplyHistories % messages.count;
                                            var replyMessage = messages.rows[replyIndex].message;
                                            var replyId = messages.rows[replyIndex].id;
                                        } else {
                                            var replyIndex = 0;
                                            var replyMessage = messages.rows[replyIndex].message;
                                            var replyId = messages.rows[replyIndex].id;
                                        }
                                        

                                        if(parseInt(clientId) > 0 && message) {

                                            // Direct message to client with client id using reply messages.
                                            BotService.directMessageToClient(gSession, clientId, replyMessage, function(resultOfDM) {
                                                var saveData = {
                                                    botId:  botId,
                                                    clientId: resultOfDM.id,
                                                    clientName: resultOfDM.name,
                                                    message: message,
                                                    imageUrl: resultOfDM.imgUrl,
                                                    replyId: replyId
                                                }

                                                // save all history to database.
                                                BotService.saveReplyHistory(saveData, function(response){
                                                    //console.log(response.id);
                                                });
                                                
                                            });
                                        }
                                    });

                                    // Recorsive count of inbox.
                                    if(countOfInbox > 0) {
                                        asyncDMToClientById()
                                    }
                                }

                                asyncDMToClientById();
                            });
                        }
                    });

                    startTime = crrTime;
                }
            }, 1000);
            /* End Direct message for realtime part */
            
            /**
             * @description 
             * Begin comment by filter to post part.
             * 
             * 1. Calculate count time that how long wait for comment.
             * 2. Initialize the global mediaId and comments.
             * 3. validate the hashtag.
             * 4. If count of global array of media id and comments then start the commentting by media id.
             * 5. Save all history to database
             */
            
            // Step1: Calculate count time. 
            var randomHashTag = '';
            var miliDay = 1000 * 60 * 60 * 24; // milisecond of day(1sec = 1000milisec)
            var timeComment = parseInt(miliDay / maxCommentDaily); //time of comment per once in day.
            var startCommentTime = 0; // Initialize value with 0.

            // Step2: Initialize the global mediaId
            var gArrMediaId = [];
            var gArrComment = [];

            // Step4: If count of global array of media id and comments then start the commentting by media id.
            var indexOfComment = 1;

            setInterval(() => {
                if(gArrMediaId.length > 0 && gArrComment.length > 0) {
                    var crrCommentTime = (new Date()).getTime(); // milisecond.

                    if(crrCommentTime - startCommentTime >= timeComment) {
                        indexOfComment++;
                        var randomCommentIndex = getRandomInt(gArrComment.length);
                        var randomCommentId = gArrComment[randomCommentIndex].id;
                        var randomComment = gArrComment[randomCommentIndex].comment;
                        
                        // Step4: Randomly comment to post.
                        BotService.commitByMediaId(gSession, gArrMediaId[indexOfComment - 1], randomComment, function(resultOfCommit) {
                            var sendData = {
                                botId: botId,
                                hashtag: randomHashTag,
                                mediaId: resultOfCommit._params.mediaId,
                                commentId: randomCommentId
                            }
                            
                            // Step5: Save all history to database
                            BotService.saveCommentHistory(sendData, function(cb) {
                                //console.log(cb);
                            });
                        });
                        
                        // Change the hashtag and getting glbal comment
                        if(indexOfComment == gArrMediaId.length) {
                            if(randomHashTag == '') {
                                randomHashTag = filters[getRandomInt(filters.length)];
                            } else {
                                // initialize the global valiables
                                indexOfComment = 0;
                                gArrMediaId = [];

                                BotService.getMediaIdByHashTag(gSession, randomHashTag, function(arrMediaId) {
                                    for(var obj of arrMediaId) {
                                        gArrMediaId.push(obj);
                                    }
                                });
        
                                BotService.getCommentByBotId(botId, function(arrComment) {
                                    for(var obj of arrComment) {
                                        gArrComment.push(obj);
                                    }
                                });
                            }
                        }

                        startCommentTime = crrCommentTime;
                    }
                } else {
                    // Step3: validate the hashtag.
                    if(randomHashTag == '') {
                        randomHashTag = filters[getRandomInt(filters.length)];
                    } else {
                        BotService.getMediaIdByHashTag(gSession, randomHashTag, function(arrMediaId) {
                            for(var obj of arrMediaId) {
                                gArrMediaId.push(obj);
                            }
                        });

                        BotService.getCommentByBotId(botId, function(arrComment) {
                            for(var obj of arrComment) {
                                gArrComment.push(obj);
                            }
                        });
                    }
                }
            }, 1000);

            process.send(1);
        }
    });

    /**
     * @description
     * Return Random integer within max values.
     * 
     * @param {INTEGER} max 
     */
    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }
});