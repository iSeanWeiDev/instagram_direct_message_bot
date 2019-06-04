'use strict';

$(document).ready(function() {
    // Connect.js global variables.
    var gBotId = 0;

    /*  Begin validate bot tab pannel */
    // validate bot global variables
    var botName = $('input#botName.form-control');
    var userName = $('input#userName.form-control');
    var responseDelay = $('input#responseDelay.form-control');
    var password = $('input#password.form-control');
    // validate form submit function.
    $('form#validateBot').submit(function(event) {
        var newBotData = {
            botName: botName.val(),
            userName: userName.val(),
            password: password.val(),
            delay : responseDelay.val()
        }
        
        $.ajax({
            type: 'POST',
            url: '/bot/validate',
            data: newBotData,
            dataType: 'JSON',
        }).done(function(response) {
            console.log(response);
            if(response && response.flag == true) {
                gBotId = response.botId;

                // change tab to filters
                $('a#validate-tab.nav-link.active').attr('aria-selected', 'false');
                $('div#validate-pan.tab-pane.fade.show.active').removeClass('active show');
                $('a#validate-tab.nav-link.active').removeClass('active show');

                $('a#filter-tab.nav-link').attr('aria-selected', 'true');
                $('div#filter-pan.tab-pane.fade').addClass('active show');
                $('a#filter-tab.nav-link').addClass('active show');
            } else {
                console.log(response);
            }
        });

        // stop the form from submitting the normal way and refreshing the page
        event.preventDefault();
    })

    /*  Begin save filters(hash tags) tab pannel */
    // save filters global variables.
    var filters = $('textarea#filters.form-control');

    $('form#saveFilters').submit(function(event) {
        var arrFilters = filters.val().replace(/ /g, '').split(',');
        
        if(gBotId > 0) {
            var sendData = {
                botId: gBotId,
                filters: arrFilters
            }

            $.ajax({
                type: 'POST',
                url: '/bot/save/filters',
                data: sendData,
                dataType: 'JSON'
            }).done(function(response){
                if(response && response.flag == true) {
                    // change tab to filters
                    $('a#filter-tab.nav-link.active').attr('aria-selected', 'false');
                    $('div#filter-pan.tab-pane.fade.show.active').removeClass('active show');
                    $('a#filter-tab.nav-link.active').removeClass('active show');

                    $('a#comment-tab.nav-link').attr('aria-selected', 'true');
                    $('div#comment-pan.tab-pane.fade').addClass('active show');
                    $('a#comment-tab.nav-link').addClass('active show');
                } else {
                    console.log(response);
                }
            });
        } else {
            console.log('Submit filters error!');
        }

        // stop the form from submitting the normal way and refreshing the page
        event.preventDefault();
    });

    /* Begin add comment tab panel */
    // add comment global variables.
    var showComment = $('textarea#show-comments.form-control');
    var comment = $('input#comment.form-control');

    var indexComment = 1;

    $('form#saveComment').submit(function(event) {
        if(comment.val() && gBotId > 0) {
            var sendData = {
                botId: gBotId,
                comment: comment.val()
            }

            $.ajax({
                type: 'POST',
                url: '/bot/add/comment',
                data: sendData,
                dataType: 'JSON'
            }).done(function(response) {
                if(response && response.flag == true) {
                    var appendCommentString = indexComment + '. ' + response.comment + '\n';

                    showComment.append(appendCommentString);
                    indexComment++;
                    comment.val('');
                } else {
                    console.log(response);
                }
            });
        } else {
            console.log('Submit comment error!');
        }

        // stop the form from submitting the normal way and refreshing the page
        event.preventDefault();
    });
    
    /* Begin add message tab panel */
    // add message global variables.
    var showMessages = $('textarea#show-messages.form-control');
    var message = $('input#message.form-control');
    var indexMessage = 1;

    $('form#saveReply').submit(function(event) {
        if(message.val() && gBotId > 0) {
            var sendData = {
                botId: gBotId,
                message: message.val()
            }

            $.ajax({
                type: 'POST',
                url: '/bot/add/message',
                data: sendData
            }).done(function(response) {
                if(response && response.flag == true) {
                    var appendMessageString = indexMessage + '. ' + response.reply + '\n';
                     
                    showMessages.append(appendMessageString);
                    indexMessage++;
                    message.val('');
                } else {
                    console.log('Submit message error!')
                }
            });
        }

        // stop the form from submitting the normal way and refreshing the page
        event.preventDefault();
    });

    /* Begin add activity setting tab panel */
    // set the global setting bot.
    var maxCommentDaily = $('input#max-comment-daily.form-control');
    
    $('form#setMaxCommentDaily').submit(function(event) {
        var sendData = {
            botId: gBotId,
            maxCommentDaily: maxCommentDaily.val()
        }

        $.ajax({
            type: "POST",
            url: '/bot/set/max',
            data: sendData,
            dataType: 'JSON'
        }).done(function(response) {
            if(response && response.flag == true) {
                console.log(response);
            } else {
                console.log('Submit set max counts of comment per day error!');
            }
        });

        // stop the form from submitting the normal way and refreshing the page
        event.preventDefault();
    });

    /* Begin create new bot */
    this.createNewBot = function() {
        var sendData = {
            botId: gBotId
        }

        if(gBotId > 0) {
            $.ajax({
                type: 'POST',
                url: '/bot/create/new',
                data: sendData
            }).done(function(response) {
                if(response && response.flag == true) {
                    $('strong.error-text-content').html('');
                    $('h5.error-text').removeClass('valid-feedback');
                    $('h5.error-text').addClass('text-success');
                    $('strong.error-text-content').append(response.message);
                    setTimeout(() => {
                        window.open('connect', '_self');
                    }, 500);

                    gBotId = 0;
                } else {
                    console.log(response);
                }
            });
        } else {
            $('strong.error-text-content').html('');
            $('h5.error-text').removeClass('valid-feedback');
            $('h5.error-text').addClass('text-danger');
            $('strong.error-text-content').append('Invalid Bot details, Click <a href="/connect" class="text-primary"> here </a> to create news.');
        }
    }
});

