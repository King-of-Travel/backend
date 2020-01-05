require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const i18n = require('i18n');
const session = require('express-session');
const pgSession = require('connect-pg-simple');
const { Pool } = require('pg');

const isDevelopment = process.env.NODE_ENV === 'development';

const app = express();

/*
 * Sessions
 */
const sessionPool = new Pool({
  user: process.env.DB_USERNAME,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD
});

const sessionStore = pgSession(session);

app.use(
  session({
    secret: process.env.USER_SESSIONS_SECRET,
    resave: false,
    rolling: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      sameSite: true,
      maxAge: 31104000000, // 1 year
      secure: false
    },
    store: new sessionStore({
      pool: sessionPool,
      tableName: process.env.USER_SESSIONS_NAME
    })
  })
);

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
  res.status(err.status || 500);

  res.json({ errors: { message: err.message } });
});

i18n.configure({
  locales: ['en', 'ru'],
  cookie: 'language',
  directory: __dirname + '/locales',
  defaultLocale: 'en'
});

module.exports = app;
