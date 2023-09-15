require('dotenv').config();

const express = require('express');
const {pool} = require('./database');  // Import the PostgreSQL pool from database.js
const {passport, ensureAuthenticated, ensureAuthorized} = require('./passport'); // Import the Passport configuration from passport.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

const usersRouter = express.Router();

// Render the login form page
usersRouter.get('/login', (req, res, next) => {
    res.status(200).send('Please log in.');
});


//usersRouter.post('/login', async (req, res, next) => {
//    
//    
//    const username = req.body.username;
//    try{
//    const userData = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
//
//    const user_id = userData.user_id;
//    const role = userData.role;
//
//    const user = { user_id: user_id, role: role };
//    const accessToken = jwt.sign(user, jwtSecret);
//    res.status(200).json({ accessToken });
//    } catch (err) {
//        res.status(400).send("error occured while logging in: ", err);
//    }
//  
//});


// Handle login form submission
usersRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body;

    try {
        // Check the username and password
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).send('No User Exists');
        }

        const passwordMatch = await bcrypt.compare(password, user.hashed_password);

        if (!passwordMatch) {
            return res.status(401).send('Invalid Password');
        }

        // If authentication is successful, issue a JWT token
        const payload = {
            sub: user.user_id,
            role: user.role,
        };

        const accessToken = jwt.sign(payload, jwtSecret);

        res.status(200).json({ accessToken });
    } catch (err) {
        res.status(400).send("Error occurred while logging in: " + err);
    }
});


//usersRouter.post('/login', (req, res, next) => {
//    passport.authenticate('jwt', async (err, user, info) => {
//      if (err) return next(err);
//      if (!user) return res.status(401).send('No User Exists');
//  
//      // If authentication is successful, issue a JWT token
//      const payload = { sub: user.user_id };
//      const token = jwt.sign(payload, jwtSecret);
//  
//      res.status(200).json({ token });
//    })(req, res, next);
//  });


usersRouter.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Error logging out:', err);
            return res.status(500).send('An error occurred while logging out.');
        }
        res.status(200).send('Successfully logged out');
    });
});

usersRouter.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Validation
        if (!username || !password) {
            return res.status(400).send('Username and password are required.');
        }
        // Check if the username is within the desired length range
        if (username.length < 4 || username.length > 40) {
            return res.status(400).send('Username must be between 4 and 20 characters.');
        }
        // Check if the password is within the desired length range
        if (password.length < 8 || password.length > 40) {
            return res.status(400).send('Password must be between 8 and 30 characters.');
        }
        // Check if the username already exists
        const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (existingUser.rows.length > 0) {
            return res.status(409).send('Username already exists.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // Insert the user into the PostgreSQL database
        await pool.query('INSERT INTO users (username, hashed_password) VALUES ($1, $2)', [username, hashedPassword]);

        // Provide feedback to the user
        res.status(201).send('Registration successful. You can now log in.');
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).send('An error occurred during registration.');
    }
});

usersRouter.get('/:user_id', ensureAuthenticated, ensureAuthorized, async (req, res) => {
    try {
        const userId = req.params.user_id;
        console.log('User ID:', userId);
        const userProfile = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        console.log('User Profile:', userProfile.rows[0]);

        if (userProfile.rows.length === 0) {
            console.log('User not found in the database.');
            return res.status(404).send('User not found.');
        }

        // Send the user's profile information as JSON
        res.status(200).json(userProfile.rows[0]);
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).send('An error occurred while fetching the user profile.');
    }
});

usersRouter.put('/:user_id', ensureAuthenticated, ensureAuthorized, async (req, res) => {
    try {
        const userId = req.params.user_id;
        // Retrieve the new profile data from the request body
        const { newUsername, newPassword } = req.body;

        if (!newUsername && !newPassword) {
            return res.status(400).send('No data provided for update.');
        }
        // Check if the username already exists
        const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [newUsername]);
        if (existingUser.rows.length > 0) {
            return res.status(409).send('Username already exists.');
        }
        if (newUsername) {
            await pool.query('UPDATE users SET username = $1 WHERE user_id = $2', [newUsername, userId]);
        }
        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await pool.query('UPDATE users SET hashed_password = $1 WHERE user_id = $2', [hashedPassword, userId]);
        }
        res.status(200).send('Profile updated successfully.');
    } catch (err) {
        console.error('Error updating user profile:', err);
        res.status(500).send('An error occurred while updating the user profile.');
    }
});

usersRouter.delete('/:user_id', ensureAuthenticated, ensureAuthorized, async (req, res) => {
    try {
        const userId = req.params.user_id;
        console.log('User ID To Delete: ', userId);
        console.log('Authenticated User Id: ', req.user.user_id);
        await pool.query('DELETE FROM users WHERE user_id = $1', [userId]);
        req.logout();
        res.status(200).send('Account deleted successfully.');
    } catch (err) {
        console.error('Error deleting user account:', err);
        res.status(500).send('An error occurred while deleting the user account.');
    }
});


module.exports = usersRouter;