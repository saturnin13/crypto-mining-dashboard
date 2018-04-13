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
    app.get('/profile', verifyLoggedIn, getConfigs, renderProfile);

    app.post('/profile', verifyLoggedIn, [formatCheckboxData,
            oneOf([[check('activate_mining').exists(), check('general_submit').exists()],
                [check('currencies.*').exists(), check('cryptocurrencies_submit').exists()]])
            // check('test').isEmail().withMessage('That email doesn‘t look right').trim().normalizeEmail().toBoolean()
        ], updateConfigs, getConfigs, renderProfile);

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
        configs: req.configs,
        errors: req.errors == null ? null:req.errors,
        csrfToken: req.csrfToken()
    });
}

function getConfigs(req, res, next) {
    db.one("SELECT * " +
        "FROM workers_configurations " +
        "WHERE user_id=$1", [req.user.id])
        .then((result1)=> {
            req.configs = result1;
            db.one("SELECT * " +
                "FROM mined_cryptocurrencies " +
                "WHERE configuration_id=$1", [result1.id])
                .then((result2)=> {
                    delete result2["id"];
                    delete result2["configuration_id"];
                    req.configs.mined_cryptocurrencies = result2;
                    next();
                })
                .catch((err) => {
                    console.log("error getting config mined_cryptocurrencies data with " + err);
                });
        })
        .catch((err) => {
            console.error("error getting config data with " + err);
        });
}

function updateConfigs(req, res, next) {
    const errors = validationResult(req);
    req.errors = errors.mapped();
    const sanitizedData = matchedData(req);

    db.query(generateSQL(sanitizedData, req.user.id))
        .then((result)=> {
            next();
        })
        .catch((err) => {
            console.log("error updating config data with " + err);
        });
}

function generateSQL(data, userId) {
    result = "";
    if(isGeneralConfigurations(data)) {
        result = "UPDATE workers_configurations " +
            "SET activate_mining=" + data.activate_mining + " " +
            "WHERE user_id=" + userId;
    } else if (isCryptocurrenciesConfigurations(data)) {
        result = "UPDATE mined_cryptocurrencies " +
            "SET " + getAllCurrencySetValue(data) + " " +
            "FROM users JOIN workers_configurations ON users.id=workers_configurations.user_id " +
            "WHERE mined_cryptocurrencies.configuration_id=workers_configurations.id AND user_id=" + userId;
    }
    return result;
}

function getAllCurrencySetValue(data) {
    for(let currency in data.currencies) {
        result += "\"" + currency.toUpperCase() + "\"" + "=" + data.currencies[currency] + ", ";
    }
    return result.substring(0, result.length - 2)
}

function formatCheckboxData(req, res, next) {
    if(isGeneralConfigurations(req.body)) {
        req.body.activate_mining = req.body.activate_mining[1] === "on";
    } else if (isCryptocurrenciesConfigurations(req.body)) {
        for(let currency in req.body.currencies) {
            req.body.currencies[currency] = req.body.currencies[currency][1] === "on";
        }
    }
    next();
}

function isGeneralConfigurations(data) {
    return data.general_submit != null;
}

function isCryptocurrenciesConfigurations(data) {
    return data.cryptocurrencies_submit != null;
}