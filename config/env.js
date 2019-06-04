/**
 * Application environment configration.
 * env.js
 * 
 * created by super-sean
 * version 1.1.1
 */

'use strict';

var env = module.exports;

// Server setting.
env.server = {
    port: 8000
};

// Token secret key.
env.session = {
    secret: '/jVdfUX+u/Kn3qPY4+ahjwQgyV5UhkM5cdh1i2xhozE=',
    resave: false, 
    saveUninitialized: false
};

// SMTP userconfigration
env.smtp = {
    service: "Gmail",
    auth: {
        user: '',
        pass: ''
    }
}