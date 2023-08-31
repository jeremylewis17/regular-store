const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BasicStrategy = require('passport-http').BasicStrategy;
const bcrypt = require('bcrypt');
const { pool } = require('./database');

passport.serializeUser((user, done) => {
    done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [id]);
        const user = result.rows[0];
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(new LocalStrategy(async (username, password, done) => {
    console.log(username);
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
    console.log(req.isAuthenticated());
    if (req.isAuthenticated()) {
        // User is authenticated; proceed to the next middleware
        return next();
    }

    // User is not authenticated; redirect to login
    res.status(401).send('You must log in to view this page');
}
//authorization middleware
function ensureAuthorized(req, res, next) {
    // Check if the authenticated user's user_id matches the user_id in the URL
    const authenticatedUserId = Number(req.user.user_id);
    const requestedUserId = Number(req.params.user_id);
    console.log('authenticated user id: ' , authenticatedUserId);
    console.log('requested user id: ' , requestedUserId);

    if (authenticatedUserId !== requestedUserId) {
        return res.status(403).send('You are not authorized to perform this action.');
    }
    next();
}


module.exports = {passport, ensureAuthenticated, ensureAuthorized};
