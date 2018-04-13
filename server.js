// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 5000;
var {Client} = require('pg');
var passport = require('passport');
var flash    = require('express-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');

var validator = require('express-validator');
var csrf = require('csurf');
var helmet = require('helmet');

var http = require('http').Server(app);
var io = require('socket.io')(http);

// configuration ===============================================================
// TODO : check that this is really useful (it might be unused and duplicated)
// Connect to the database
var pgClient = new Client(configDB);
pgClient.connect(); // connect to our database

var sessionMiddleware = session({ secret: 'ilovescotchscotchyscotchscotch', cookie: { maxAge: 36000000 }});

require('./config/passport')(passport); // pass passport for configuration

// adds some security to http header
app.use(helmet());

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(sessionMiddleware); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// static directory for stylesheet
app.use("/styles", express.static(__dirname + "/views/styles")); // static css routing
app.use("/scripts", express.static(__dirname + "/views/scripts")); // static scripts routing

// form simple validator
app.use(validator());

// protect against cross-site request forgery
app.use(csrf({ cookie: true }));


// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// API real time data ==========================================================
require('./app/realtimeAPI.js')(io, sessionMiddleware);

// launch ======================================================================
http.listen(port);
console.log('The magic happens on port ' + port);