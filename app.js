var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var pg = require('pg');
var dbString = require('./db.js');
var conString = dbString.dbString;

var routes = require('./routes/index');
var api = require('./routes/api');
var webapi = require('./routes/webapi')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Auth stuff
passport.use(new LocalStrategy(
    function(username, password, done) {
      pg.connect(conString, function(err, client, connect_done) {
        client.query ({
          text   : "SELECT * FROM webuser WHERE username = $1",
          name   : "Auth User",
          values : [username]
        }, function(err, results) {
          connect_done();
          if(err) {
            console.log("Error")
            return done(err);
          }
          if (!results.rows.length > 0) {
            console.log("No users found");
            return done(null, false, {message: "User Not Found"});
          }
          if (results.rows[0].password !== password) {
            console.log("Incorrect Password");
            return done(null, false, {message: "Incorrect pasword"});
          }
          console.log("Authenticated");
          return done(null, {id: results.rows[0].id, username: results.rows[0].username, role: results.rows[0].role});
        });
      })
    }
))

passport.serializeUser(function(user, done) {
  done(null, user);
})

passport.deserializeUser(function(user, done) {
  done(null, user);
});

var auth = function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.send(401);
  } else {
    next();
  }
}


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret:'beep.secret.brake'}));
app.use(passport.initialize());
app.use(passport.session());  
app.use('/', routes);
app.use('/api', api);
app.use('/web/api/', auth, webapi);

app.post('/login', passport.authenticate('local'), function(req, res) {
  res.send(req.user);
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/*', function(req, res) {
  res.sendfile(__dirname + '/views/index.html')
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
/*
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
*/

// production error handler
// no stacktraces leaked to user
/*app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
*/

module.exports = app;
