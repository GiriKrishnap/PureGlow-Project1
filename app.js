// modules //////////////////////////////////////////////////////////////////////////////////////////
const _404 = require('./middleware/404');
const errorHandler = require('./middleware/error-handler');
const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const nocache = require('nocache');
const mongoose = require('mongoose');
const sessionMiddleWare = require('./middleware/session');
require('dotenv/config');
////////////////////////////////////////////////////////////////////////////////////////////////////
// mongoDB-----------------------------------------------------------------------------------------
mongoose.connect(process.env.CONNECTION_STRING);

// Router-import------------------------------------------------------------------------------------
const adminRouter = require('./routes/adminRoute');
const userRouter = require('./routes/userRoute');

// view engine setup--------------------------------------------------------------------------------
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// middleWare---------------------------------------------------------------------------------------
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(nocache());
app.use(sessionMiddleWare);
// router--------------------------------------------------------------------------------------------
app.use('/admin', adminRouter);
app.use('/', userRouter);

// catch 404 ---------------------------------------------------------------------------------------
app.use(_404);

// error handler------------------------------------------------------------------------------------
app.use(errorHandler);

////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = app;
