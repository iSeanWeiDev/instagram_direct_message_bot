// var schedule = require('node-schedule');
// var CronJob = require('cron').CronJob; 
// var cron = require('node-cron');
var Pusher = require('pusher');
var UserMananagerController = {};
var UserModel = require('../models').User;



UserMananagerController.init = function(req, res) {
    setTimeout(() => {
        getAllUsers(cb => {
            var countOfUsers = cb.length;
            async function asyncFetchingUser() {
                countOfUsers --;
                
                if(isEndOfMonth(cb[countOfUsers]) == false) {
                    var pusher = new Pusher({
                        appId: process.env.PUSHER_APP_ID,
                        key: process.env.PUSHER_APP_KEY,
                        secret: process.env.PUSHER_APP_SECRET,
                        cluster: process.env.PUSHER_APP_CLUSTER
                    });
    
                    var indexOfSendData = 'ToUserExpiredMembership:'+cb[countOfUsers].id;
                    console.log("TCL: asyncFetchingUser -> indexOfSendData", indexOfSendData)
                    var sendData = {
                        userId: cb[countOfUsers].id,
                        message: 'Your need to add new billing for this month, While you add membership you can not use your bots'
                    }
    
                    pusher.trigger('notifications', indexOfSendData, sendData, req.headers['x-socket-id']);
                } 
    
                if(countOfUsers > 0) {
                    asyncFetchingUser();
                }
            }
    
            asyncFetchingUser();
        });
    }, 100000);

}

function getAllUsers(cb) {
    UserModel.findAll({
        where: {
            state: 1
        }
    }).then(function(users) {
        var data = [];

        for(var obj of users) {
            data.push(obj.dataValues);
        }

        cb(data); 
    }).catch(function(error) {

    });
}

function isEndOfMonth(object) {
    var crrDate = (new Date()).getTime();
    var memDate = (new Date(object.updateAt)).getTime();

    if(crrDate - memDate > (30 * 24 * 60 * 60 * 1000)) {
        return true
    } 

    return false;
}


module.exports = UserMananagerController;