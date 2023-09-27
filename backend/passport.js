require('dotenv').config();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const jwt = require('jsonwebtoken');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
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

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3001/auth/google/callback', // Update the callback URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if the Google user is already linked to a local user account
          const query = 'SELECT * FROM federated_credentials WHERE provider = ? AND subject = ?';
          const [existingCredential] = await pool.query(query, ['google', profile.id]);
  
          if (existingCredential) {
            // Google account is linked to a local user, fetch the user record
            const userQuery = 'SELECT * FROM users WHERE user_id = ?';
            const [user] = await pool.query(userQuery, [existingCredential.user_id]);
  
            if (user) {
              return done(null, user);
            }
          } else {
            // Google account is not linked to a local user, create a new user record
            const insertUserQuery = 'INSERT INTO users (name) VALUES (?) RETURNING user_id';
            const [newUser] = await pool.query(insertUserQuery, [profile.displayName]);
  
            if (newUser && newUser.user_id) {
              // Link the Google account to the new user
              const insertCredentialQuery =
                'INSERT INTO federated_credentials (user_id, provider, subject) VALUES (?, ?, ?)';
              await pool.query(insertCredentialQuery, [newUser.user_id, 'google', profile.id]);
  
              const payload = {
                sub: newUser.user_id,
                role: newUser.role,
              };
  
              const accessToken = jwt.sign(payload, 'YOUR_JWT_SECRET'); // Replace with your JWT secret
  
              return done(null, { ...newUser, accessToken });
            }
          }
  
          return done(null, false);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

function ensureAuthenticated(req, res, next) {
    passport.authenticate('jwt', { session: false }, (err, user) => {
      if (err) return next(err);
      if (!user) return res.status(401).send('Unauthorized'); // Invalid or missing JWT
  
      // If JWT is valid, attach the user object to the request
      req.user = user;
      return next();
    })(req, res, next);
  }

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
