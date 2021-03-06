var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var flash = require('connect-flash');

//STUFF I'M ADDING 
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./schemas/user.js');

//passport serialization/deserialization 
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//DONE WITH STUFF I'M ADDING 


var index = require('./routes/index');
var users = require('./routes/users');
var app = express();

app.use(flash());

//SOCKET IO
app.io = require('socket.io')();

// app.get('/chat', function(req, res){
//   res.render('chat.hbs');
// });
var test = app.io.of('/general-chat');

test.on('connection', function(socket) {
  console.log('someone connected to chat');
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    test.emit('chat message', msg);
  });
});

app.io.on('connection', function(socket){
  // console.log('yo');
  socket.on('disconnect', function(){
    console.log('bai');
  });
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    app.io.emit('chat message', msg);
  });
});

// database setup
// mongoose.connect('mongodb://localhost/app');
mongoose.connect('mongodb://heroku_vjphwnnq:psa8d92epggk9s8acu3ipfel2n@ds127429.mlab.com:27429/heroku_vjphwnnq');
var connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));
connection.on('connected', function() {
  console.log('database connected!');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
var exphbs = require('express-handlebars');
app.engine('.hbs', exphbs({extname: '.hbs'}));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//ALSO STUFF I'M ADDING: passport stuff
app.use(session({ secret: 'my super secret secret', resave: 'false', saveUninitialized: 'true' }));
app.use(passport.initialize());
app.use(passport.session());
//----//

app.use('/', index);
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
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(err);

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
