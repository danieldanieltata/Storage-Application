var express       = require('express');
var path          = require('path');
var favicon       = require('serve-favicon');
var logger        = require('morgan');
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var handlebars    = require('express-handlebars');

// Loggin system 
var passport      = require('passport');
var flash         = require('connect-flash');
var session       = require('express-session');
require('./config/passport')(passport);

// Connect to mongoDB 
var mongoose      = require('mongoose');

//mongoose.connect('mongodb://localhost/StorageApplicationDB');
mongoose.connect('mongodb://danieltalor:DanielTalor@ds133231.mlab.com:33231/storage-application-db');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();


app.use(session( { secret: 'thisislanstorageappsecret' } ));
app.use(passport.initialize());
app.use(passport.session()); // passport session 
app.use(flash());

// view engine setup -- set to Handlebars
app.engine('handlebars', handlebars({extname:'handlebars', layoutsDir: __dirname + '/views/layouts/', defaultLayout: 'layout'}))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

// Include Jquery and Bootstrap
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/fonts', express.static(__dirname + '/node_modules/bootstrap/dist/fonts'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
