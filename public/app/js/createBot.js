'use strict';

$(document).ready(function() {
    // Global variables
    var gBotId = 0;

    /* Begin validate bot tab pannel controller */
    // Define global values.
    var botName = $('input#bot-name.form-control'),
        accountName = $('input#account-name.form-control'),
        accountPassword = $('input#account-password.form-control'),
        customerProxyUrl = $('input#customer-proxy-url.form-control'),
        switchProxy = $('input#switch-proxy.form-check-input');

    $('form#validate-bot-form').submit(function(event) {
        var proxyUrl = customerProxyUrl.val();
        
        if(switchProxy.is(":checked")) {
            proxyUrl = null;
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
                console.log(response);
            } else {

            }
        })

        // stop the form from submitting the normal way and refreshing the page
        event.preventDefault();
    });

    /* End validate bot tab pannel controller */
});