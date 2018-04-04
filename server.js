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
var helmet = require('helmet')


// configuration ===============================================================
// TODO : check that this is really useful (it might be unused and duplicated)
var pgClient = new Client(configDB);
pgClient.connect(); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// adds some security to http header
app.use(helmet());

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch', cookie: { maxAge: 60000 }})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// static directory for stylesheet
app.use("/styles", express.static(__dirname + "/views/styles")); // static css routing

// form simple validator
app.use(validator());

// protect against cross-site request forgery
app.use(csrf({ cookie: true }));


// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);


// TODO: delete
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

// const client = new Client({
//     connectionString: "postgres://lncgqbiyoivknm:16497d98c045a638262b080a515986d172cadc0799e23f7ebc1cd225556116a7@ec2-54-217-214-201.eu-west-1.compute.amazonaws.com:5432/dabhdlnlb316fm",
//     ssl: true,
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