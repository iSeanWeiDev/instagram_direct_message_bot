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
                url: '/users/notification',
                data: sendData
            }).done(function (response) {
                if(response.flag == true) {
                    var appendNotificationString = '';
                    var countOfNotificationIndex = 0;
                    for(var objType of response.data) {
                        for(var objNotification of objType.ChallengeHistories) {
                            countOfNotificationIndex++;
                            appendNotificationString = appendNotificationString + 
                            `<a class="dropdown-item preview-item">
                                <div class="preview-thumbnail">
                                <img src="assets/images/faces/face12.jpg" alt="image" class="img-sm profile-pic"> </div>
                                <div class="preview-item-content flex-grow py-2">
                                <p class="preview-subject ellipsis font-weight-medium text-dark">`+ objType.message +` </p>
                                <p class="font-weight-light small-text"> `+ objNotification.bot_name + ` &nbsp; ` + objType.data +` </p>
                                </div>
                            </a> `;
                        }
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
                    console.log(data);
                    
                    var notification = new Notification(data);
                    notification.onclick = function (event) {
                        console.log(event);
                        //window.location.href = '/posts/' + post._id;
                        event.preventDefault();
                        notification.close();
                    }
                }
            });
});

// var sendData = {
//     userId: req.session.user.userId,
//     botId: data.botId,
//     botName: cb.bot_name,
//     accountName: cb.account_name,
//     accountImage: cb.account_image_url,
//     type: obj.type
// }