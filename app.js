/**
 * Application main file.
 * app.js
 * 
 * created by super-sean
 * version 1.1.1
 */

 'use strict';

// Import npm modules.
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var ejs = require('ejs');
var expressLayouts = require('express-ejs-layouts');
var bodyParser = require('body-parser');
var session = require('express-session');

// Import main modules.
var config = require('./config/env');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var botRouter = require('./routes/bots');
var boardRouter = require('./routes/board');
var apiRouter = require('./routes/api');

// Initialize application.
var app = express();

// Set application send the request with HTTP.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";

// View engine setup.
app.engine('ejs', ejs.renderFile);
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

// Set Development method.
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Set Project structure.
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);

// Set env for session.
app.use(session(config.session));

// Rendering routes using express router.
app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/bot', botRouter);
app.use('/api', apiRouter);
app.use('/board', boardRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;