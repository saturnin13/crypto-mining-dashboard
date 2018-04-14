// app/routes.js
var { check, oneOf, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

// DB in postgres
var db = require('../app/mydb').db();

module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs', {csrfToken: req.csrfToken()}); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage'),
            csrfToken: req.csrfToken() });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage'),
            csrfToken: req.csrfToken() });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the verifyLoggedIn function)
    app.get('/profile', verifyLoggedIn, renderProfile);

    // app.post('/profile', verifyLoggedIn, [formatCheckboxData,
    //         oneOf([[check('activate_mining').exists(), check('general_submit').exists()],
    //             [check('currencies.*').exists(), check('cryptocurrencies_submit').exists()]])
    //         // check('test').isEmail().withMessage('That email doesn‘t look right').trim().normalizeEmail().toBoolean()
    //     ], updateConfigs, getConfigs, renderProfile);

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

};

// route middleware to make sure a user is logged in
function verifyLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

function renderProfile(req, res) {
    res.render('profile.ejs', {
        user : req.user, // get the user out of session and pass to template
        csrfToken: req.csrfToken()
    });
}