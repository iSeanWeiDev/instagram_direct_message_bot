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
                window.open('dashboard', '_self');
            } else {

            }
            console.log(response);
        });

        // stop the form from submitting the normal way and refreshing the page
        event.preventDefault();
    });
});