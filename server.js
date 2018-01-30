// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 5000;
var {Client} = require('pg');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');

// configuration ===============================================================
var pgClient = new Client(configDB);
pgClient.connect(); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);


// TODO: delete
// console.log('test1234');
//
// var http = require("http");
// const PORT = process.env.PORT || 5000;
//
// http.createServer(function (request, response) {
//
//     // Send the HTTP header
//     // HTTP Status: 200 : OK
//     // Content Type: text/plain
//     response.writeHead(200, {'Content-Type': 'text/plain'});
//
//     // Send the response body as "Hello World"
//     response.end('Hello World\n');
// }).listen(PORT);
//
// // Console will print the message
// console.log('Server running at http://127.0.0.1:8081/');
//
//
// const {Client} = require('pg');
//
// const client = new Client({
//     connectionString: process.env.DATABASE_URL,
//     ssl: false,
// });
//
// client.connect();
//
// client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
//     if (err) throw err;
// for (let row of res.rows) {
//     console.log(JSON.stringify(row));
// }
// client.end();
// });