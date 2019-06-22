'use strict';

$(document).ready(function() {
    var email = $('input#email.form-control'),
        password = $('input#password.form-control');

    var mkConfig = {
        positionY: 'top',
        positionX: 'right',
        max: 15,
        scrollable: false
    };

    mkNotifications(mkConfig);

    $('form').submit(function(event) {
        var sendData = {
            email: email.val(),
            password: password.val()
        }

        $.ajax({
            method: 'POST',
            url: '/users/login',
            data: sendData,
        }).done(function(response) {
            if(response.flag == true) {
                mkNoti(
                    'Congratration!',
                    response.message,
                    {
                        status:'success'
                    }
                );

                setTimeout(() => {
                    window.open('/dashboard', '_self');
                }, 1000);
            } else {
                mkNoti(
                    'Authenication failure!',
                    response.message,
                    {
                        status:'danger'
                    }
                );
            }
        });

        // stop the form from submitting the normal way and refreshing the page
        event.preventDefault()
    });
});