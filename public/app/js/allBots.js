'use strict';

$(document).ready(function() {
    /**
     * Global setting
     * 
     * 1. jquery-toast
     * 2. user id
     */
    var mkConfig = {
        positionY: 'top',
        positionX: 'right',
        max: 15,
        scrollable: false
    };

    mkNotifications(mkConfig);
    var userId = $('input#logedin-user-id');

/* ================================================ */

    // Delete bot by id
    this.deleteBot = function(id) {
        var sendData = {
            botId: id,
            userId:  userId.val()
        }
        
        $.ajax({
            method: 'POST',
            url: '/bots/delete',
            data: sendData,
        }).done(function(response) {
            if(response && response.flag == true) {
                mkNoti(
                    'Success!',
                    response.message,
                    {
                        status:'success'
                    }
                );
                    
                setTimeout(() => {
                    location.reload();
                }, 1000);
            } else {
                mkNoti(
                    'Failure!',
                    response.message,
                    {
                        status:'danger'
                    }
                );
            }
        });
    }
/* ================================================ */
    this.loadMore = function(id) {
        if(userId.val() && id > 0) {
            var sendData = {
                botId: id,
                userId: userId.val()
            }

            $.ajax({
                method: 'POST',
                url: '/bots/get/loadmore',
                data: sendData
            }).done(function(response) {
                var tmpFilters = '';
                var tmpComments = '';
                var tmpReplies = '';

                for(var obj of response) {
                    if(obj.type == 'filters') {
                        tmpFilters = tmpFilters + obj.data + ',\n';
                    }

                    if(obj.type == 'comment') {
                        tmpComments = tmpComments + obj.data + ',\n';
                    }

                    if(obj.type == 'reply') {
                        tmpReplies = tmpReplies + obj.data + ',\n';
                    }
                }

                $('textarea#filters'+id+'.form-control').val(tmpFilters);
                $('textarea#comments'+id+'.form-control').val(tmpComments);
                $('textarea#replies'+id+'.form-control').val(tmpReplies);

                tmpFilters = '';
                tmpComments = '';
                tmpReplies = '';
            });
        }
    }

/* ================================================ */

    this.updateBot = function(id) {
        console.log(id);
    }

    this.changStatus = function(id) {
        console.log(id);
        console.log($('button#change-status-'+id));
    }
});