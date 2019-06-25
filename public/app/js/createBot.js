'use strict';

$(document).ready(function() {
    // Global variables
    var gBotId = 0;

    var mkConfig = {
        positionY: 'top',
        positionX: 'right',
        max: 15,
        scrollable: false
    };

    mkNotifications(mkConfig);

    /* Begin validate bot tab pannel controller */
    // Define global values.
    var botName = $('input#bot-name.form-control'),
        accountName = $('input#account-name.form-control'),
        accountPassword = $('input#account-password.form-control'),
        customerProxyUrl = $('input#customer-proxy-url.form-control'),
        switchProxy = $('input#switch-proxy.form-check-input');

    switchProxy.change(function() {
        if(switchProxy.is(":checked")) {
            customerProxyUrl.val('');
            customerProxyUrl.attr("readonly", "true");
        } else {
            customerProxyUrl.removeAttr("readonly");
        }
    })

    $('form#validate-bot-form').submit(function(event) {
        var proxyUrl = customerProxyUrl.val();
        
        if(switchProxy.is(":checked")) {
            proxyUrl = null;
            switchProxy.css('disply', 'none');
        }

        var newBotData = {
            botName: botName.val(),
            accountName: accountName.val(),
            accountPassword: accountPassword.val(),
            proxyUrl: proxyUrl
        }

        $.ajax({
            method: 'POST',
            url: '/bots/validate',
            data: newBotData
        }).done(function(response) {
            if(response && response.flag == true) {
                gBotId = response.botId;
                
                // Change to the filters tab.
                $('a#validate-tab.nav-link.active').attr('aria-selected', 'false');
                $('div#validate-pan.tab-pane.fade.show.active').removeClass('active show');
                $('a#validate-tab.nav-link.active').removeClass('active show');
        
                $('a#filter-tab.nav-link').attr('aria-selected', 'true');
                $('div#filter-pan.tab-pane.fade').addClass('active show');
                $('a#filter-tab.nav-link').addClass('active show');

                // Toast success.
                mkNoti(
                    'Congratration!',
                    response.message,
                    {
                        status:'success'
                    }
                );
            } else {
                mkNoti(
                    'Validate bot failed!',
                    response.message,
                    {
                        status:'danger'
                    }
                );
            }
        })

        // stop the form from submitting the normal way and refreshing the page
        event.preventDefault();
    });

    /* End validate bot tab pannel controller */

/* ================================================================================= */
    /* Begin save filters tab pannel controller */
    // Define global values
    var filters = $('textarea#filters.form-control');

    $('form#save-filters-form').submit(function(event) {
        var arrFilters = [];
        var arrData = filters.val().replace(/\n/g, '').replace(/ /g, '').replace(/#/g, '').split(',');
        
        for(var obj of arrData) {
            if(obj != '') {
                arrFilters.push(obj);
            }
        }

        if(gBotId > 0) {
            var filterData = {
                botId: gBotId,
                filters: arrFilters
            }

            $.ajax({
                method: 'POST',
                url: '/bots/save/filters',
                data: filterData
            }).done(function(response) {
                if(response && response.flag == true) {
                    // Toast the success
                    mkNoti(
                        'Successed!',
                        response.message,
                        {
                            status:'success'
                        }
                    );
                    
                    // Change to the comment tab.
                    $('a#filter-tab.nav-link.active').attr('aria-selected', 'false');
                    $('div#filter-pan.tab-pane.fade.show.active').removeClass('active show');
                    $('a#filter-tab.nav-link.active').removeClass('active show');

                    $('a#comment-tab.nav-link').attr('aria-selected', 'true');
                    $('div#comment-pan.tab-pane.fade').addClass('active show');
                    $('a#comment-tab.nav-link').addClass('active show');
                } else {
                    mkNoti(
                        'Submit filters error!',
                        response.message,
                        {
                            status:'danger'
                        }
                    );  
                }
            });
        } else {
            mkNoti(
                'Submit filters error!',
                'Please check network connection.',
                {
                    status:'danger'
                }
            );
        }

        // stop the form from submitting the normal way and refreshing the page
        event.preventDefault();
    });

    /* End save filters tab pannel controller */

/* ================================================================================= */
    /* Begin save comment tab pannel controller */
    // Define global values.
    var showComment = $('textarea#show-comments.form-control'),
        comment = $('input#comment.form-control'),
        indexComment = 1;
    $('form#save-comment-form').submit(function(event) {
        if(comment.val() && gBotId > 0) {
            var commentData = {
                botId: gBotId,
                comment: comment.val() 
            }

            $.ajax({
                method: 'POST',
                url: '/bots/save/comment',
                data: commentData
            }).done(function(response) {
                if(response && response.flag == true) {
                    var appendCommentString = indexComment + '. ' + response.text + '\n';

                    showComment.append(appendCommentString);
                    indexComment++;
                    comment.val('');

                    mkNoti(
                        'Success!',
                        response.message,
                        {
                            status:'success'
                        }
                    );
                } else {
                    mkNoti(
                        'Submit comment error!',
                        response.message,
                        {
                            status:'danger'
                        }
                    );
                }
            });
        } else {
            mkNoti(
                'Submit Comment error!',
                'Please check network connection.',
                {
                    status:'danger'
                }
            );
        }

        // stop the form from submitting the normal way and refreshing the page
        event.preventDefault();
    });
    /* End save comment tab pannel controller */

/* ================================================================================= */

    /* Begin save default reply tab pannel controller */
    // Define global values.
    var showReply = $('textarea#show-reply.form-control'),
        reply = $('input#reply.form-control'),
        indexReply = 1;

    $('form#save-reply-form').submit(function(event) {
        if(reply.val() && gBotId > 0) {
            var replyData = {
                botId: gBotId,
                reply: reply.val()
            }

            $.ajax({
                method: 'POST',
                url: '/bots/save/reply',
                data: replyData
            }).done(function(response) {
                if(response && response.flag == true) {
                    var strAppendReply = indexReply + '. ' + response.text + '\n';

                    showReply.append(strAppendReply);
                    indexReply++;

                    reply.val('');

                    mkNoti(
                        'Success!',
                        response.message,
                        {
                            status:'success'
                        }
                    );
                } else {
                    mkNoti(
                        'Submit Default Reply error!',
                        response.message,
                        {
                            status:'danger'
                        }
                    );
                }
            })
        } else {
            mkNoti(
                'Submit Default Reply error!',
                'Please check network connection.',
                {
                    status:'danger'
                }
            );
        }
        // stop the form from submitting the normal way and refreshing the page
        event.preventDefault();
    })
    /* End save default reply tab pannel controller */

/* ================================================================================= */

    /* Begin save follow up message tab pannel controller */
    // Define global values.
    var fum2thMessage = $('textarea#fum-2th-message.form-control'),
        fum6thMessage = $('textarea#fum-6th-message.form-control'),
        fum12thMessage = $('textarea#fum-12th-message.form-control'),
        fum21thMessage = $('textarea#fum-21th-message.form-control'),
        fum1monthMessage = $('textarea#fum-1month-message.form-control'),
        fum2monthMessage = $('textarea#fum-2month-message.form-control'),
        fum3monthMessage = $('textarea#fum-3month-message.form-control'),
        fum4monthMessage = $('textarea#fum-4month-message.form-control');

    $('form#save-fum-form').submit(function(event) {
        if(gBotId > 0) {
            var fumData = {
                botId: gBotId,
                data: [
                    { day: 2, message: fum2thMessage.val() },
                    { day: 6, message: fum6thMessage.val() },
                    { day: 12, message: fum12thMessage.val() },
                    { day: 21, message: fum21thMessage.val() },
                    { day: 30, message: fum1monthMessage.val() },
                    { day: 60, message: fum2monthMessage.val() },
                    { day: 90, message: fum3monthMessage.val() },
                    { day: 120, message: fum4monthMessage.val() }
                ]
            };

            $.ajax({
                method: 'POST',
                url: '/bots/save/fum',
                data: fumData
            }).done(function(response) {
                if(response && response.flag == true) {
                    // Change to the setting tab.
                    $('a#fum-tab.nav-link.active').attr('aria-selected', 'false');
                    $('div#fum-pan.tab-pane.fade.show.active').removeClass('active show');
                    $('a#fum-tab.nav-link.active').removeClass('active show');

                    $('a#setting-tab.nav-link').attr('aria-selected', 'true');
                    $('div#setting-pan.tab-pane.fade').addClass('active show');
                    $('a#setting-tab.nav-link').addClass('active show');

                    mkNoti(
                        'Success!',
                        response.message,
                        {
                            status:'success'
                        }
                    );
                } else {
                    mkNoti(
                        'Submit Default Reply error!',
                        response.message,
                        {
                            status:'danger'
                        }
                    );
                }
            })
        } else {
            mkNoti(
                'Submit Default Reply error!',
                'Please check network connection.',
                {
                    status:'danger'
                }
            );
        }

        // stop the form from submitting the normal way and refreshing the page
        event.preventDefault();
    })

    /* End save follow up message tab pannel controller */

/* ================================================================================= */

    /* Begin save setting tab pannel controller */
    // Define global values.
    var messageDelay = $('input#message-delay.form-control');
    var amountComment = $('input#amount-comment.form-control');
    var confirmSetting = $('input#confirm-setting.form-check-input');

    $('form#save-setting-form').submit(function(event) {
        
        
        if(confirmSetting.is(':checked') == false) {
            mkNoti(
                'Confirm your setting!',
                'Before create new bot, confirm your setting.',
                {
                    status:'warning'
                }
            );
        } else if(gBotId > 0) {
            var settingData = {
                botId: gBotId,
                messageDelay: messageDelay.val(),
                amountComment: amountComment.val()
            }

            $.ajax({
                method: 'POST',
                url: '/bots/save/setting',
                data: settingData
            }).done(function(response) {
                if(response && response.flag == true) {
                    mkNoti(
                        'Success!',
                        response.message,
                        {
                            status:'success'
                        }
                    );

                    $.confirm({
                        title: 'Success!',
                        content: 'You can create a bot by inputed your details.',
                        buttons: {
                            confirm: function () {
                                var sendData = {
                                    botId: gBotId
                                }
                                
                                $.ajax({
                                    method: 'POST',
                                    url: '/bots/create/new',
                                    data: sendData
                                }).done(function(response) {
                                    if(response && response.flag == true) {
                                        mkNoti(
                                            'Congratration!',
                                            response.message,
                                            {
                                                status:'success'
                                            }
                                        );

                                        setTimeout(() => {
                                            window.open('connect', '_self');
                                        }, 1000);
                                    } else {
                                        mkNoti(
                                            'Create Bot Failure!',
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
                                    'Create Bot canceled!',
                                    'Check your bot state and create if you want.',
                                    {
                                        status:'info'
                                    }
                                );
                            }
                        }
                    });
                } else {
                    mkNoti(
                        'Submit Bot Setting error!',
                        response.message,
                        {
                            status:'danger'
                        }
                    );
                }
            })
        } else {
            mkNoti(
                'Submit Bot Setting error!',
                'Please check network connection.',
                {
                    status:'danger'
                }
            );
        }
        
        // stop the form from submitting the normal way and refreshing the page
        event.preventDefault();
    });
    /* End save setting tab pannel controller */
});