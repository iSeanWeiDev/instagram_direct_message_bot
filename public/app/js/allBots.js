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

    this.updateBot = function(id) {
        var messageDelay = $('input#message-delay-'+id),
            maxComment = $('input#max-comment-'+id),
            filters = $('textarea#filters-'+id).val().replace(/\n/g, '').replace(/ /g, '').replace(/#/g, '').split(','),
            comments = $('textarea#comments-'+id).val().replace(/\n/g, '').replace(/ /g, '').replace(/#/g, '').split(','),
            replies = $('textarea#replies-'+id).val().replace(/\n/g, '').replace(/ /g, '').replace(/#/g, '').split(','),
            fum1 = $('textarea#fum-'+id+'-2th'),
            fum2 = $('textarea#fum-'+id+'-6th'),
            fum3 = $('textarea#fum-'+id+'-12th'),
            fum4 = $('textarea#fum-'+id+'-21th'),
            fum5 = $('textarea#fum-'+id+'-1month'),
            fum6 = $('textarea#fum-'+id+'-2month'),
            fum7 = $('textarea#fum-'+id+'-3month'),
            fum8 = $('textarea#fum-'+id+'-4month');

        var sendData = {
            botId: id,
            messageDelay: messageDelay.val(),
            maxComment: maxComment.val(),
            filters: filters,
            comments: comments,
            replies: replies,
            fums: [
                fum1.val(), 
                fum2.val(), 
                fum3.val(), 
                fum4.val(), 
                fum5.val(), 
                fum6.val(), 
                fum7.val(), 
                fum8.val()
            ]
        }

        $.ajax({
            method: 'POST',
            url: '/bots/update',
            data: sendData
        }).done(function(response) {
            if(response && response.flag == true) {
                mkNoti(
                    'Your Bot Paused!',
                    response.message,
                    {
                        status:'success'
                    }
                );

                setTimeout(() => {
                    window.open('allbots', '_self');
                }, 1000);
            } else {
                mkNoti(
                    'Pause Bot Failure!',
                    response.message,
                    {
                        status:'danger'
                    }
                );
            }
        });
    }
/* ================================================ */
    this.changStatus = function(id) {
        var getBotStatus = $('button#change-status-'+id).children().attr('id');

        if(getBotStatus == 'pause'+id) {
            $.confirm({
                title: '<span class="text-danger"><strong><i class="mdi mdi-robot-industrial"></i> &nbsp; Wait! (~_^)</strong><span>',
                content: '<span class="text-primary">Are you sure you want to pause the bot?</span>',
                buttons: {
                    confirm: function () {
                        var sendData = {
                            botId: id,
                            status: 0 // 0: paused, 1: played
                        }
                        
                        $.ajax({
                            method: 'POST',
                            url: '/bots/change/status',
                            data: sendData
                        }).done(function(response) {
                            if(response && response.flag == true) {
                                $('button#change-status-'+id).children().remove();

                                $('button#change-status-'+id).append(`<h7 id="play`+ id + `" class="m-0 p-0">
                                                                                        <i class="fa fa-play"></i>
                                                                                        Play
                                                                                    </h7>`);
                                mkNoti(
                                    'Your Bot Paused!',
                                    response.message,
                                    {
                                        status:'success'
                                    }
                                );
                            } else {
                                mkNoti(
                                    'Pause Bot Failure!',
                                    response.message,
                                    {
                                        status:'danger'
                                    }
                                );
                            }
                        });

                        
                    },
                    cancel: function () {
                        mkNoti(
                            'Pause Bot canceled!',
                            'Check your bot state and Make sure why you want pause the bot.',
                            {
                                status:'info'
                            }
                        );
                    }
                }
            });
        } else {

            $.confirm({
                title: '<span class="text-success"><strong><i class="mdi mdi-robot-industrial"></i> &nbsp; Wait! (^_^)</strong><span>',
                content: '<span class="text-primary">Are you sure you want to play the bot?</span>',
                buttons: {
                    confirm: function () {
                        var sendData = {
                            botId: id,
                            status: 1 // 0: paused, 1: played
                        }
                        
                        $.ajax({
                            method: 'POST',
                            url: '/bots/change/status',
                            data: sendData
                        }).done(function(response) {
                            if(response && response.flag == true) {
                                $('button#change-status-'+id).children().remove();

                                $('button#change-status-'+id).append(`<h7 id="pause`+ id + `" class="m-0 p-0">
                                                                                        <i class="fa fa-pause"></i>
                                                                                        Pause
                                                                                    </h7>`);
                                mkNoti(
                                    'Your Bot Activity Started!',
                                    response.message,
                                    {
                                        status:'success'
                                    }
                                );
                            } else {
                                mkNoti(
                                    'Start Bot Failure!',
                                    response.message,
                                    {
                                        status:'danger'
                                    }
                                );
                            }
                        });

                        
                    },
                    cancel: function () {
                        mkNoti(
                            'Start Bot canceled!',
                            'Check your bot state and Make sure why you want pause the bot.',
                            {
                                status:'info'
                            }
                        );
                    }
                }
            });
        }
    }
});