'use strict';

$(document).ready(function () {
    this.editProfile = function () {
        $('input#first-name').removeAttr('disabled');
        $('input#last-name').removeAttr('disabled');
        $('input#user-name').removeAttr('disabled');
        $('input#phone').removeAttr('disabled');
        $('input#email').removeAttr('disabled');
        $('input#password').removeAttr('disabled');
        $('button#btnSave').removeAttr('hidden');
        $('button#btnEdit').attr('hidden', 'true');
    }

    this.saveProfile = function(id) {
        var sendData = {
            id: id,
            fistName: $('input#first-name').val(),
            lastName: $('input#last-name').val(),
            userName: $('input#user-name').val(),
            phone: $('input#phone').val(),
            email: $('input#email').val(),
            password: $('input#password').val(),
        }
        
        $.ajax({
            method: "POST",
            url: "/users/update/profile",
            data: sendData,
            dataType: "JSON",
        }).done(function(response) {
            if(response && response.flag == true) {

            } else {

            }
        });
    }

    this.reset = function () {
        location.reload();
    };

    this.inputToken = function(){
        $('input#inputBillToken').removeAttr('disabled');
        $('button#btnInputToken').attr('hidden', 'true');
        $('button#btnSendToken').removeAttr('hidden');
    }

    this.sendToken = function(id) {
        console.log(id);
    }
});