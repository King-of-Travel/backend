require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const i18n = require('i18n');

const isDevelopment = process.env.NODE_ENV === 'development';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(i18n.init);

app.use(require('./routes'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = isDevelopment ? err : {};

  res.status(err.status || 500);

  res.json({ message: err.message });
});

i18n.configure({
  locales: ['en', 'ru'],
  cookie: 'language',
  directory: __dirname + '/locales',
  defaultLocale: 'en'
});

module.exports = app;
