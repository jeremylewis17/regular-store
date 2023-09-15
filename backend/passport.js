require('dotenv').config();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const jwt = require('jsonwebtoken');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const bcrypt = require('bcrypt');
const { pool } = require('./database');

const jwtSecret = process.env.JWT_SECRET;

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret,
  };

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

passport.use(
    new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
      try {
        const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [jwt_payload.sub]);
        const user = result.rows[0];
  
        if (!user) {
          return done(null, false, { message: 'Incorrect username or password.' });
        }
  
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    })
  );

//passport.use(new LocalStrategy(async (username, password, done) => {
//    console.log(username);
//    try {
//        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
//        const user = result.rows[0];
//
//        if (!user) {
//            return done(null, false, { message: 'Incorrect username or password.' });
//        }
//
//        const passwordMatch = await bcrypt.compare(password, user.hashed_password);
//        if (!passwordMatch) {
//            return done(null, false, { message: 'Incorrect username or password.' });
//        }
//
//        return done(null, user);
//    } catch (err) {
//        return done(err);
//    }
//}));

// Passport.js middleware for ensuring authentication
//function ensureAuthenticated(req, res, next) {
//    const authHeader = req.headers['authorization'];
//    const token = authHeader && authHeader.split(' ')[1];
//    if (token == null) return res.sendStatus(401);
//
//    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//        if (err) return res.sendStatus(403);
//        req.user = user;
//        next();
//    })
//}

function ensureAuthenticated(req, res, next) {
    passport.authenticate('jwt', { session: false }, (err, user) => {
      if (err) return next(err);
      if (!user) return res.status(401).send('Unauthorized'); // Invalid or missing JWT
  
      // If JWT is valid, attach the user object to the request
      req.user = user;
      return next();
    })(req, res, next);
  }
  

//function ensureAuthenticated(req, res, next) {
//    console.log('is user authenticated: ' , req.isAuthenticated());
//    if (req.isAuthenticated()) {
//        // User is authenticated; proceed to the next middleware
//        return next();
//    }
//
//    // User is not authenticated; redirect to login
//    res.status(401).send('You must log in to view this page');
//}

//authorization middleware
function ensureAuthorized(req, res, next) {
    // Check if the user is a manager
    const userRole = req.user.role;
    if (userRole === 'manager') {
        console.log('manager id: ', req.user.user_id);
        return next();
    }

    // Check if the authenticated user's user_id matches the user_id in the URL
    const authenticatedUserId = Number(req.user.user_id);
    const requestedUserId = Number(req.params.user_id);
    console.log('authenticated user id: ', authenticatedUserId);
    console.log('requested user id: ', requestedUserId);

    if (authenticatedUserId !== requestedUserId) {
        return res.status(403).send('You are not authorized to perform this action.');
    }
    next();
}



function ensureAuthorized(req, res, next) {
    // Check if the user is a manager
    const userRole = req.user.role;
    if (userRole === 'manager') {
        console.log('manager id: ', req.user.user_id);
        return next();
    }

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

// Middleware to check if the authenticated user is a manager
function ensureManager(req, res, next) {
    if (req.user.role === 'manager') {
      return next();
    }
    // User is not a manager; send a forbidden response
    res.status(403).send('Permission denied. You must be a manager to perform this action.');
  }


module.exports = {passport, ensureAuthenticated, ensureAuthorized, ensureManager};
