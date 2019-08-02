'use strict';

$(document).ready(function() {
    $('.datetimepicker.form-control').datetimepicker({
        format:'Y.m.d H:i',
        lang:'en'
    });

    var mkConfig = {
        positionY: 'top',
        positionX: 'right',
        max: 15,
        scrollable: false
    };

    mkNotifications(mkConfig);

    // update the proxy
    this.saveProxy = function(id) {
        var changedProxyUrl = $('#proxy-url-' + id).val();
        var changedExpiredDate = $('#expire-date-' + id).val();

        if(!changedProxyUrl || !changedExpiredDate) {
            mkNoti(
                'Check input fields.',
                'Fill all input fields.',
                {
                    status:'danger'
                }
            );
        } else if(new Date(changedExpiredDate).getTime() < new Date().getTime()) {
            mkNoti(
                'Check expire date!',
                'Invalid your proxy expire date.',
                {
                    status:'info'
                }
            ); 
        } else {
            var sendData = {
                id: id,
                url: changedProxyUrl,
                expireDate: new Date(changedExpiredDate).toISOString()
            }

            $.ajax({
                method: 'POST',
                url: '/admin/update/proxy',
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
                        window.open('/admin-proxy', '_self');
                    }, 1000);
                } else {
                    mkNoti(
                        'Update failure!',
                        response.message,
                        {
                            status:'danger'
                        } 
                    );
                }
            })
        }
    }

    // Delete the proxy
    this.deleteProxy = function(id) {
        if(id >= 0) {
            $.confirm({
                title: 'Sure delete?',
                content: 'If you delete once, can not recover again.',
                buttons: {
                    confirm: function () {
                        var sendData = {
                            id: id
                        }

                        $.ajax({
                            method: 'POST',
                            url: '/admin/delete/proxy',
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
                                    window.open('/admin-proxy', '_self');
                                }, 1000);
                            } else {
                                mkNoti(
                                    'Delete failure!',
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
                            'Delete canceled!',
                            'Please check your proxies',
                            {
                                status:'info'
                            }
                        );
                    }
                }
            });
        }
    }

    // Insert new proxy
    this.insertNewProxy = function() {
        var newProxyUrl = $('input#new-proxy-url.form-control').val();
        var newExpireDate = $('input#new-expire-date.form-control').val();

        if(!newProxyUrl || !newExpireDate) {
            mkNoti(
                'Check input fields.',
                'Fill all input fields.',
                {
                    status:'danger'
                }
            );
        } else if(new Date(newExpireDate).getTime() < new Date().getTime()) {
            mkNoti(
                'Check expire date!',
                'Invalid your proxy expire date.',
                {
                    status:'info'
                }
            ); 
        } else {
            var sendData = {
                url: newProxyUrl,
                expireDate: new Date(newExpireDate).toISOString()
            }

            $.ajax({
                method: 'POST',
                url: '/admin/create/proxy',
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
                        window.open('/admin-proxy', '_self');
                    }, 1000);
                } else {
                    mkNoti(
                        'Update failure!',
                        response.message,
                        {
                            status:'danger'
                        } 
                    );
                }
            });
        }
    }
});