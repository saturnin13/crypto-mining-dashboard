var db;
exports.db = function() {
    if (!db) {
        var pgp = require('pg-promise')(/*options*/);
        db = pgp(process.env.HEROKU_POSTGRESQL_MAROON_URL || "postgres://lmxhpacdmmgnfr:0f78fab407cdf1699b50b2fec55a742f65ab1a5cfbbb2c166394a09eb6acf652@ec2-54-247-89-189.eu-west-1.compute.amazonaws.com:5432/denvqvnkc5gm9j?ssl=true");
    }
    return db;
}