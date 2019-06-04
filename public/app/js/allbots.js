'use strict';

$(document).ready(function() {
    // Global user id.
    var userId = $('input#userid');

    /**
     * @description
     * Delete bot by botid and userid
     * 
     * @param {INTEGER} id
     */
    this.deleteBot = function(id) {
        var sendData = {
            botId: id,
            userId:  userId.val()
        }
        
        $.ajax({
            type: 'POST',
            url: '/bot/delete',
            data: sendData,
            dataType: 'JSON'
        }).done(function(response) {
            if(response && response.flag == true) {
                location.reload();
            } else {
                // Validate bot
                console.log(response);
            }
        });
    }

    /**
     * @description
     * Get details by botid and userid.
     * 
     * @param {INTEGER} id
     */
    this.loadMore = function(id) {
        var userId = $('input#userid');

        if(userId && id) {
            var sendData = {
                botId: id,
                userId: userId.val()
            }

            $.ajax({
                type: 'POST',
                url: '/bot/get/loadmore',
                data: sendData,
                dataType: 'JSON'
            }).done(function(response) {
                if(response && response.flag == true) {
                    // Append text to filters textarea with javascript.
                    var tmpFilter = '';
                    for(var obj of JSON.parse(response.data.filter)) {
                        tmpFilter = tmpFilter + obj + ',\n';
                    }
                    $('textarea#filters'+ response.data.botId +'.form-control').val(tmpFilter);
                    tmpFilter = ''; // Initialize filter buffer.

                    // Append text to comments textarea with javascript.
                    var tmpComment = '';
                    for(var obj of response.data.comment) {
                        tmpComment = tmpComment + obj.data + ',\n';
                    }
                    $('textarea#comments'+ response.data.botId +'.form-control').val(tmpComment);
                    tmpComment = ''; // Initialize comments buffer.

                    // Append text to replies textarea with javascript.
                    var tmpReplies = ''; 
                    for(var obj of response.data.reply) {
                        tmpReplies = tmpReplies + obj.data + ',\n';
                    }
                    $('textarea#replies'+ response.data.botId +'.form-control').val(tmpReplies);
                    tmpReplies = ''; // Initialize replies buffer.
                } else {
                    console.log(response);
                }
            });
        }
    }

    /**
     * @description
     * Update bot state by botid and userid.
     * 
     * @param {INTEGER} id
     */
    this.saveProperties = function(id) {
        console.log(id);

    }

    /**
     * @description
     * Take challenge by botid, useid, and phonenumber.
     * 
     * @param {INTEGER} id
     */
    this.challengeBot = function(id) {
        console.log(id);
    }
});