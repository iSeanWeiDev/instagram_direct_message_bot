/**
 * @description Admin Service library.
 * @name adminService.js
 * @version 2.1.2
 * @author Super-Sean1995
 */

'use strict';

// Import project models
var ProxyModel = require('../models').Proxy;

// Definition Bot Service module.
var AdminService = {};

// Sub functions
AdminService.updateProxyById = updateProxyById;
AdminService.deleteProxyById = deleteProxyById;
AdminService.insertNewProxy = insertNewProxy;

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

// exports module
module.exports = AdminService;