const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { pool } = require('./database');

passport.serializeUser((user, done) => {
    done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        const user = result.rows[0];
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            return done(null, false, { message: 'Incorrect username or password.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.hashed_password);
        if (!passwordMatch) {
            return done(null, false, { message: 'Incorrect username or password.' });
        }

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

// Passport.js middleware for ensuring authentication
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        // User is authenticated; proceed to the next middleware
        return next();
    }

    // User is not authenticated; redirect to login
    res.redirect('/login');
}

module.exports = {passport, ensureAuthenticated};
