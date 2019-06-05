'use strict';

$(document).ready(function() {
    var firstName = $('input#firstName.form-control'),
        lastName = $('input#lastName.form-control'),
        email = $('input#email.form-control'),
        password = $('input#password.form-control'),
        rpassword = $('input#rpassword.form-control'),
        code = $('input#code.form-control');

    $('form').submit(function(event) {
        if(password.val() != rpassword.val()) {
            $('h5.error-text').removeClass('valid-feedback');
            $('h5.error-text').addClass('text-danger');
            $('strong.error-text-content').append('Invalid password.');
        } else {
            var sendData = {
                firstName: firstName.val(),
                lastName: lastName.val(),
                email: email.val(),
                password: password.val(),
                rpassword: rpassword.val(),
                code: code.val()
            }
            
            $.ajax({
                method: 'POST',
                url: '/user/signup',
                data: sendData
            }).done(function(response) {
                console.log(response);
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
                        window.open('/', '_self');
                    }, 1000);
                } else {
                    var mkConfig = {
                        positionY: 'top',
                        positionX: 'right',
                        max: 10,
                        scrollable: false
                    };
                
                    mkNotifications(mkConfig);
                
                    mkNoti(
                        'Sign up failure!',
                        response.message,
                        {
                            status:'danger'
                        }
                    );
                }
                
            });
        }

        // stop the form from submitting the normal way and refreshing the page
        event.preventDefault();
    });
});