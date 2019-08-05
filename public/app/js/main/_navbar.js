'use strict';

$(document).ready(function() {
    var userId = $('input#logedin-user-id');
    var countOfNotification = $('span#count-notification');
    var notificationDropDownMenu = $('div#notification-dropdown-menu');
    var notificationHeaderString = $('p#notification-header-string');

    init();

    // init function to display the notifiaction to navbar.
    function init() {
        if(userId.val() > 0) {
            var sendData = {
                userId: userId.val()
            }
    
            $.ajax({
                method: 'POST',
                url: '/challenges/dropdown/notification',
                data: sendData
            }).done(function (response) {
                if(response.flag == true) {
                    var appendNotificationString = '';
                    var countOfNotificationIndex = response.count;

                    for(var obj of response.data) {
                        appendNotificationString = appendNotificationString + 
                            `<a href="#" class="dropdown-item preview-item">
                                <div class="preview-thumbnail">
                                    <div class="preview-item-content flex-grow py-2">
                                        <p class="preview-subject ellipsis font-weight-medium text-danger"> "`+ obj.bot_name + '" Bot (' + obj.account_name + ')' +` </p>
                                        <p class="font-weight-light ellipsis small-text text-google"> `+ obj.message +` </p>
                                    </div>
                                </div>
                            </a> `;
                    }

                    countOfNotification.html(countOfNotificationIndex);
                    notificationHeaderString.html('You have '+countOfNotificationIndex+' notifications')
                    notificationDropDownMenu.append(appendNotificationString);
                }
            });
        }
    }

    // initialize the pusher.
    var pusher = new Pusher('a8bc919ab3d65a7c3875', {cluster: 'us3'});

    // retrieve the socket ID once we're connected
    pusher.connection.bind('connected', function () {
        // attach the socket ID to all outgoing Axios requests
        axios.defaults.headers.common['X-Socket-Id'] = pusher.connection.socket_id;
    });

    // it will be work on "https://" secure mode.
    Notification.requestPermission().then(function(permission) {
        //console.log(permission);
    });

    pusher.subscribe('notifications')
            .bind('ToUser:'+userId.val(), function (data) {
                if(data.userId == userId.val()) {
                    var appendNotificationString = `<a href="#" class="dropdown-item preview-item">
                                <div class="preview-thumbnail">
                                    <div class="preview-item-content flex-grow py-2">
                                        <p class="preview-subject ellipsis font-weight-medium text-danger"> "`+ data.botName + '" Bot (' + data.accountName + ')' +` </p>
                                        <p class="font-weight-light small-text text-google"> `+ data.message +` </p>
                                    </div>
                                </div>
                            </a> `;

                    notificationDropDownMenu.append(appendNotificationString);
                    var notificationIndex = parseInt(countOfNotification.text()) + 1;
                    countOfNotification.html(notificationIndex);
                    
                    

                    var notification = new Notification(`${data.botName} had been paused by ${data.data}`);
                    notification.onclick = function (event) {
                        console.log(event);
                        //window.location.href = '/posts/' + post._id;
                        event.preventDefault();
                        notification.close();
                    }
                }
            })
});