var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var winston = require('winston');
var cors = require('cors');

var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;

var routes = require('./routes/index');
var users = require('./routes/users');
var posts = require('./routes/posts');
var account = require('./routes/account');

var app = express();

// setup logger for express
winston.add(winston.transports.File, { 
  name: 'booklog3-error',
  filename: 'booklog3-error.log',
  level: 'error'
});

winston.add(winston.transports.File, { 
  name: 'booklog3',
  filename: 'booklog-info.log',
  level: 'info'
});

mongoose.connect('mongodb://booklog3:123456@ds053130.mongolab.com:53130/booklog3');
mongoose.connection.on('error', function() {
  winston.log('error', 'MongoDB: error');
});
mongoose.connection.on('open', function() {
  winston.log('info', 'MongoDB: connected');
});

var postSchema = new mongoose.Schema({
  title  :  { type: String },
  content   :  { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  timeCreated: { type: Date, default: Date.now }
});

var userSchema = new mongoose.Schema({
  username: { type: String, unique: true, select: false  },
  displayName: { type: String, unique: true },
  email: { type: String, unique: true, select: false  },
  timeCreated: { type: Date, default: Date.now, select: false },
  facebook: { type: Object, select: false }
});

var Post = mongoose.model('post', postSchema);
var User = mongoose.model('user', userSchema);

app.db = {
  model: {
    Post: Post,
    User: User,
  }
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'booklog store' }));  

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new FacebookStrategy({
    clientID: '1559480364270197',
    clientSecret: '4d5d1e9389c179142348cbb7044bdab1',
    callbackURL: "/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    app.db.model.User.findOne({"facebook._json.id": profile._json.id}, function(err, user) {
         if (!user) {
           var obj = {
             username: profile.username,
             displayName: profile.displayName,
             email: '',
             facebook: profile
            };
    
            var doc = new app.db.model.User(obj);
            doc.save();
    
            user = doc;
         }
         console.log(user);
    
         return done(null, user); // verify callback                                         
    });
  }
)); 


var corsOptions = {
  origin: 'http://example.com'
};


// cors
app.use(cors(corsOptions));  

app.use('/', routes);
app.use('/', posts);
app.use('/users', users);
app.use('/account', account);

app.get('/login/facebook', 
  passport.authenticate('facebook'));

app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/login/fail' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('http://jollen.github.io/booklog/');
  });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
app.use(function(err, req, res, next) {
  if (err === 'data is empty') {
    res.status(500).send('data is empty');
  } else {
    next(err);
  }
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
