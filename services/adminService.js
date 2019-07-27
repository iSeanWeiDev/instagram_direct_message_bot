/**
 * @description Admin Service library.
 * @name adminService.js
 * @version 2.1.2
 * @author Super-Sean1995
 */

'use strict';
var Sequelize = require('sequelize');

// Import project models
var BotModel = require('../models').Bot;
var ProxyModel = require('../models').Proxy;
var Op = Sequelize.Op;
// Definition Bot Service module.
var AdminService = {};

// Sub functions
AdminService.updateProxyById = updateProxyById;
AdminService.deleteProxyById = deleteProxyById;
AdminService.insertNewProxy = insertNewProxy;
AdminService.getBotsByUserIdForAdmin = getBotsByUserIdForAdmin;

/**
 * @description
 * update selected proxy by customer
 * 
 * @param {INTEGER} id 
 * @param {OBJECT} data 
 * @param {OBJECT} cb 
 */
function updateProxyById(id, data, cb) {
    ProxyModel.update(data, {
        where: {
            id: id
        }
    }).then(function(result) {
        if(result[0] == 1) {
            cb({
                flag: true,
                message: 'Updated your proxy setting.'
            })
        } else {
            cb({
                flag: false,
                message: 'Server connection error.'
            })
        }

    }).catch(function(error) {
        console.log('Update proxy error:' + error);

        cb({
            flag: false,
            message: 'Server connection error.'
        })
    })
}

/**
 * @description
 * delete proxy by id
 * 
 * @param {INTEGER} id 
 * @param {OBJECT} cb 
 */
function deleteProxyById(id, cb) {
    ProxyModel.update({is_deleted: 'Y'}, {
        where: {
            id: id
        }
    }).then(function(result) {
        if(result[0] == 1) {
            cb({
                flag: true,
                message: 'Deleted proxy'
            })
        } else {
            cb({
                flag: false,
                message: 'Sever connection error'
            })
        }

    }).catch(function(error) {
        console.log('delete proxy by id error: ' + error);
        cb({
            flag: false,
            message: 'Server connection error'
        })
    })
}

/**
 * @description
 * insert new proxy by super admin
 * 
 * @param {OBJECT} data 
 * @param {OBJECT} cb 
 */


function insertNewProxy(data, cb) {
    ProxyModel.create(data)
        .then(function(proxy) {
            if(proxy.dataValues.id > 0) {
                cb({
                    flag: true,
                    message: 'Inserted your new proxy'
                })
            } else {
                cb({
                    flag: false,
                    message: 'Server connection error'
                })
            }
        })
        .catch(function(error) {
            console.log('Insert new proxy error: ' + error);

            cb({
                flag: false,
                message: 'Server connection error'
            })
        });
}



function getBotsByUserIdForAdmin(id, flag, cb) {
    console.log(id, flag);
    if(id > 0 && flag == 1) {
        BotModel.findAll({
            attributes: [
                'id', 'bot_name','state', 'is_activated'
            ],
            where: {
                user_id: id,
                state: 1
            }
        }).then(function (bots) {
            var arrBots = [];
    
            for(var obj of bots) {
                arrBots.push(obj.dataValues)
            }
            
            cb({
                flag: true,
                data: arrBots
            });
    
            arrBots = [];
        }).catch(function(error) {
            cb({
                flag: false,
                data: error
            });
        });
    }

    if(id > 0 && flag == 2) {
        BotModel.findAll({
            attributes: [
                'id', 'bot_name','state', 'is_activated'
            ],
            where: {
                user_id: id,
                state: {
                    [Op.gt]: 1
                }
            }
        }).then(function (bots) {
            var arrBots = [];
    
            for(var obj of bots) {
                arrBots.push(obj.dataValues)
            }
            
            cb({
                flag: true,
                data: arrBots
            });
    
            arrBots = [];
        }).catch(function(error) {
            cb({
                flag: false,
                data: error
            });
        });   
    }

    if(id > 0 && flag == 3) {
        BotModel.findAll({
            attributes: [
                'id', 'bot_name','state', 'is_activated'
            ],
            where: {
                user_id: id,
                state: 0
            }
        }).then(function (bots) {
            var arrBots = [];
    
            for(var obj of bots) {
                arrBots.push(obj.dataValues)
            }
            
            cb({
                flag: true,
                data: arrBots
            });
    
            arrBots = [];
        }).catch(function(error) {
            cb({
                flag: false,
                data: error
            });
        });
    }

    if(id > 0 && flag == 4) {
        BotModel.findAll({
            attributes: [
                'id', 'bot_name','state', 'is_activated'
            ],
            where: {
                user_id: id
            }
        }).then(function (bots) {
            var arrBots = [];
    
            for(var obj of bots) {
                arrBots.push(obj.dataValues)
            }
            
            cb({
                flag: true,
                data: arrBots
            });
    
            arrBots = [];
        }).catch(function(error) {
            cb({
                flag: false,
                data: error
            });
        });
    }
}

// exports module
module.exports = AdminService;