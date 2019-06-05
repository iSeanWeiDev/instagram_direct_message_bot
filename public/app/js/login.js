'use strict';

$(document).ready(function() {
    var userName = $('input#email.form-control'),
        password = $('input#password.form-control');

    $('form').submit(function(event) {
        var sendData = {
            userName: userName.val(),
            password: password.val()
        }
        $.ajax({
            method: 'POST',
            url: '/user/login',
            data: sendData
        }).done(function(response) {
            if(response.flag == true) {
                var mkConfig = {
                    positionY: 'top',
                    positionX: 'right',
                    max: 10,
                    scrollable: false
                };
            
                mkNotifications(mkConfig);
            
                mkNoti(
                    'Congratration!',
                    response.message,
                    {
                        status:'success'
                    }
                );

                setTimeout(() => {
                    window.open('dashboard', '_self');
                }, 500);
            } else {
                var mkConfig = {
                    positionY: 'top',
                    positionX: 'right',
                    max: 10,
                    scrollable: false
                };
            
                mkNotifications(mkConfig);
            
                mkNoti(
                    'Sign in failure!',
                    response.message,
                    {
                        status:'danger'
                    }
                );
            }
        });

        // stop the form from submitting the normal way and refreshing the page
        event.preventDefault();
    });
});