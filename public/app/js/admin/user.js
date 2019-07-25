'use strict';

$(document).ready(function() {
    var table = $('#example').DataTable();

    $('div.fg-toolbar.ui-toolbar.ui-widget-header.ui-helper-clearfix.ui-corner-tl.ui-corner-tr').append(`<div class="text-center">
                                                                                                            <h4><strong>User management</strong></h4>
                                                                                                        </div>`);
    
    $('div#example_info.dataTables_info').remove();
    $('div.fg-toolbar.ui-toolbar.ui-widget-header.ui-helper-clearfix.ui-corner-bl.ui-corner-br').append(`<div class="mt-2">
                                                                                                            <button class="btn btn-primary"
                                                                                                                type="button"
                                                                                                                data-toggle="modal" 
                                                                                                                data-target="#create-new-user">
                                                                                                                <i class="fa fa-plus"></i>
                                                                                                                New User
                                                                                                            </button>
                                                                                                        </div>`);
    var mkConfig = {
        positionY: 'top',
        positionX: 'right',
        max: 15,
        scrollable: false
    };

    mkNotifications(mkConfig);
    
    this.modalUser = function(id) {
        $('#example tbody').on('click', 'tr', function () {
            var data = table.row( this ).data();
            var role = 0;
            switch (data[4]) {
                case 'tier1':
                    role = 1;
                    break;
                case 'tier2':
                    role = 2;
                    break;
                case 'tier3':
                    role = 3;
                    break;
                case 'tier4':
                    role = 4;
                    break;
                case 'admin':
                    role = 5;
                    break;
                default:
                    break;
            }

            $('input#first-name-'+id).val(data[0]);
            $('input#last-name-'+id).val(data[1]);
            $('input#user-name-'+id).val(data[2]);
            $('input#email-'+id).val(data[3]);
            $('select#choose-role-'+id).val(role);
        });
    }

    this.saveUser = function (id) {
        var sendData = {
            userId: id,
            firstName: $('input#first-name-'+id).val(),
            lastName: $('input#last-name-'+id).val(),
            userName: $('input#user-name-'+id).val(),
            email: $('input#email-'+id).val(),
            role: $('select#choose-role-'+id).val()
        }

        $.ajax({
            method: 'POST',
            url: '/users/save',
            data: sendData
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
                }, 500);
            } else {
                mkNoti(
                    'Failed!',
                    response.message,
                    {
                        status:'danger'
                    }
                );
                setTimeout(() => {
                    location.reload();
                }, 500);
            }
        })
    }

    this.deleteUser = function(id) {
        var sendData = {
            userId: id
        }
        
        $.ajax({
            method: 'POST',
            url: '/users/delete',
            data: sendData
        }).done(function (response) {
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
                }, 500);
            } else {
                mkNoti(
                    'Failed!',
                    response.message,
                    {
                        status:'danger'
                    }
                );
                setTimeout(() => {
                    location.reload();
                }, 500);
            }
        });
    }

    $('form#create-new-user-form').submit(function(event) {
        var sendData = {
            firstName: $('input#new-first-name').val(),
            lastName: $('input#new-last-name').val(),
            userName: $('input#new-user-name').val(),
            email: $('input#new-email').val(),
            password: $('input#new-password').val(),
            role: $('select#new-choose-role').val()
        }

        $.ajax({
            method: 'POST',
            url: '/users/create',
            data: sendData
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
                }, 500);
            } else {
                mkNoti(
                    'Failed!',
                    response.message,
                    {
                        status:'danger'
                    }
                );

                setTimeout(() => {
                    location.reload();
                }, 500);
            }
        });

        // stop the form from submitting the normal way and refreshing the page
        event.preventDefault();
    });
});


