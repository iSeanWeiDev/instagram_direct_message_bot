'use strict';

$(document).ready(function() {
    window.token = 'PRIVATED_TOKEN_FOR_TESTING';

    var firstName = $('input#first-name.form-control'),
        lastName = $('input#last-name.form-control'),
        userName = $('input#user-name.form-control'),
        email = $('input#email.form-control'),
        password = $('input#password.form-control'),
        rpassword = $('input#rpassword.form-control'),
        billToken = $('input#bill-token.form-control');

    var mkConfig = {
        positionY: 'top',
        positionX: 'right',
        max: 15,
        scrollable: false
    };

    mkNotifications(mkConfig);

    $('form#signup').submit(function(event) {
        if(password.val() != rpassword.val()) {
            mkNoti(
                'Sign up failure!',
                'Please input same as password!',
                {
                    status:'danger'
                }
            );
        } else {
            var sendData = {
                firstName: firstName.val(),
                lastName: lastName.val(),
                email: email.val(),
                userName: userName.val(),
                password: password.val(),
                billToken: billToken.val()
            }

            $.ajax({
                method: 'POST',
                url: '/users/signup',
                data: sendData
            }).done(function(response) {
                console.log(response);
                if(response.isToken == true) {
                    if(response.flag == true) {
                        mkNoti(
                            'Congratration!',
                            response.message,
                            {
                                status:'success'
                            }
                        );
    
                        setTimeout(() => {
                            window.open('/', '_self');
                        }, 1500);
                    } else {
                        mkNoti(
                            'Sign up failure!',
                            response.message,
                            {
                                status:'danger'
                            }
                        );
                    }
                } else {
                    window.open('/maintance', '_self');
                }
            });
        }
        
        // stop the form from submitting the normal way and refreshing the page
        event.preventDefault();
    });
});