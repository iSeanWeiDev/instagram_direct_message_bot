/**
 * @description Proxy Service library.
 * @name proxyService.js
 * @version 2.1.2
 * @author Super-Sean1995
 */

'use strict';
// Import npm modules.

// Import Data Models.
var ProxyModel = require('../models').Proxy;

// Definition Bot Service module.
var ProxyService = {};

// Define BotService Sub Functions.
ProxyService.getAllProxies = getAllProxies;

/**
 * @description
 * get all proxies
 * 
 * @param {OBJECT} cb 
 */
function getAllProxies(cb) {
    ProxyModel.findAll({
        attributes: ['id', 'url', 'expire_date', 'state'],
        where: {
            is_deleted: 'N'
        }
    }).then(function(result) {
        var arrSendData = [];

        if(result.length > 0) {
            for(var obj of result) {
                var date = new Date(obj.dataValues.expire_date);
                arrSendData.push({
                    id: obj.dataValues.id,
                    url: 'http://' + obj.dataValues.url,
                    expireDate: (date.getMonth()+1) + '/'+date.getDate() +'/' + date.getFullYear(),
                    usage: obj.dataValues.state
                });
            }

            cb(arrSendData);
            arrSendData = [];
        } else {
            cb(arrSendData);
        }
        

        
    }).catch(function(error) {
        console.log('Get all proxy error: ' + error);
    });
}

// Export BotService module.
module.exports = ProxyService;