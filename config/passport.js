// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var User            = require('../app/models/user');

// DB in postgres
var pgp = require('pg-promise')(/*options*/);
var db = pgp(process.env.DATABASE_URL);

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        console.log("deserialize ", id);
        db.one("SELECT id, email, password, type FROM users " +
            "WHERE id = $1", [id])
            .then((user)=>{
                console.log("deserializeUser ", user);
                done(null, user);
            })
            .catch((err)=>{
                done(new Error(`User with the id ${id} does not exist`));
            })
        // User.findById(id, function(err, user) {
        //     done(err, user);
        // });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) {

            // asynchronous
            // User.findOne wont fire unless data is sent back
            // process.nextTick(function() {
            //
            //     // find a user whose email is the same as the forms email
            //     // we are checking to see if the user trying to login already exists
            //     User.findOne({ 'local.email' :  email }, function(err, user) {
            //         // if there are any errors, return the error
            //         if (err) {
            //             return done(err);
            //         }
            //
            //         // check to see if theres already a user with that email
            //         if (user) {
            //             return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            //         } else {
            //
            //             // if there is no user with that email
            //             // create the user
            //             var newUser            = new User();
            //
            //             // set the user's local credentials
            //             newUser.local.email    = email;
            //             newUser.local.password = newUser.generateHash(password);
            //
            //             // save the user
            //             newUser.save(function(err) {
            //                 if (err)
            //                     throw err;
            //                 return done(null, newUser);
            //             });
            //         }
            //
            //     });
            //
            // });

        }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form

            console.log("Login process:", email);
            return db.one("SELECT id, email, password, type " +
                "FROM users " +
                "WHERE email=$1 AND password=$2", [email, password])
                .then((result)=> {
                    console.log("success login with " + email + " and " + password + " and " + result);
                    return done(null, result);
                })
                .catch((err) => {
                    console.log("error login with " + err);
                    return done(null, false, {message:'Wrong user name or password'});
                });

            // // find a user whose email is the same as the forms email
            // // we are checking to see if the user trying to login already exists
            // User.findOne({ 'local.email' :  email }, function(err, user) {
            //     // if there are any errors, return the error before anything else
            //     if (err)
            //         return done(err);
            //
            //     // if no user is found, return the message
            //     if (!user)
            //         return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
            //
            //     // if the user is found but the password is wrong
            //     if (!user.validPassword(password))
            //         return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
            //
            //     // all is well, return successful user
            //     return done(null, user);
            // });

        }));

};