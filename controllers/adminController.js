/**
 * @description Admin Controller.
 * @name adminController.js
 * @version 2.1.2
 * @author Super-Sean1995
 */
'use strict';

// import global functions.
var AdminService = require('../services/adminService');

var AdminController = {};

// update proxy setting by id.
AdminController.updateProxy = function(req, res) {
    var id = req.body.id;
    var data = {
        url: req.body.url,
        expire_date: req.body.expireDate
    }

    AdminService.updateProxyById(id, data, function(cb) {
        res.json(cb);
    });
}

// safe delete proxy by id
AdminController.deleteProxy = function(req, res) {
    AdminService.deleteProxyById(req.body.id, function(cb) {
         res.json(cb);
    });
}

// create new proxy inputed data.
AdminController.createProxy = function(req, res) {
    var createData = {
        url: req.body.url,
        expire_date: req.body.expireDate,
        state: 0,
        is_deleted: 'N'
    }

    AdminService.insertNewProxy(createData, function(cb) {
        res.json(cb);
    });
}

// get bots by types
AdminController.getBotsByTypes = function(req, res) {
    var id = req.body.id;
    var flag = req.body.flag;

    AdminService.getBotsByUserIdForAdmin(id, flag, function(cb) {
        res.json(cb);
    });
}

module.exports = AdminController;