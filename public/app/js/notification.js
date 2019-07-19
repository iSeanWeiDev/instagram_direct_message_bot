'use strict';

$(document).ready(function () {

    var mkConfig = {
        positionY: 'top',
        positionX: 'right',
        max: 15,
        scrollable: false
    };

    mkNotifications(mkConfig);

    var countOfNotification = $('span#count-notification');
    var notificationDropDownMenu = $('div#notification-dropdown-menu');
    var notificationHeaderString = $('p#notification-header-string');

    $('input.form-check-inline').change(function() {
        if(this.checked) {
            var sendData = {
                index: this.value
            }

            $.ajax({
                method: 'POST',
                url: '/challenges/read/notification',
                data: sendData
            }).done(function (response) {
                var botName = $('span#botname-'+response.id).text().trim().split(' ')[1];
                console.log();
                mkNoti(
                    'Great!',
                    'You are checked out the '+botName+' notification',
                    {
                        status:'success'
                    }
                );

                if(response.flag == true) {
                    setTimeout(() => {
                        var notificationIndex = parseInt(countOfNotification.text()) - 1;
                        countOfNotification.html(notificationIndex);

                        notificationHeaderString.html('You have '+notificationIndex+' notifications')
                        $('div#card-'+response.id).remove();
                    }, 800);
                    console.log();
                }
            });
        }
    });
});