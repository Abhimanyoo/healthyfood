var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport')
var session = require('express-session')
var mongoose = require('mongoose');
//var config = require('./config/config.json')
var mongodbStore = require('connect-mongo')(session)
var dbconfig = require('./config/database.js');
var cors = require('cors')

var app = express()

app.use(cors())

var index = require('./routes/index');
var users = require('./routes/users');

//mongoose and mongo connection
mongoose.promise = global.Promise;
mongoose.createConnection(dbconfig.url);
var db = mongoose.connection;

//mongodb
app.use(function(req, res, next) {
  req.db = db;
  next();
});

//session mongoose
app.use(session({
  name: 'christalone.sess',
  secret: 'not of corruptible things',
  store: new mongodbStore({
    mongooseConnection: db,
    touchAfter: 24 * 3600
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  }
})); // session secret

//Models
var models = require("./models/index.js");

//passport session setup
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
//load passport strategies
user = require('./config/passport.js')(passport, models);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'client')));

//viewa engine
//app.set('views', __dirname + '/views')
app.set('views', path.join(__dirname, 'views'));
//app.engine('pug', require('pug').__express)
app.set('view engine', 'ejs')

app.use('/', require('./routes/index')(passport, models));
app.use('/users', users);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {err};

  // render the error page
  res.status(err.status || 500).json(err);

});



module.exports = app;
