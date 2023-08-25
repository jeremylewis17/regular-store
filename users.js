const express = require('express');
const pool = require('./database');  // Import the PostgreSQL pool from database.js
const {passport, ensureAuthenticated} = require('./passport'); // Import the Passport configuration from passport.js
const bcrypt = require('bcrypt');

const usersRouter = express.Router();

usersRouter.get('/login', (req, res, next) => {
    res.render('login');
});

usersRouter.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('profile');
});

usersRouter.get('/logout', (req, res) => {
    req.logout();
    res.redirect('../');
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

usersRouter.get('/profile', ensureAuthenticated, async (req, res) => {
    try {
        // Retrieve user profile data from the database based on the authenticated user's ID
        const userId = req.user.user_id; // Assuming information is stored in req.user

        const userProfile = await pool.query('SELECT username FROM users WHERE user_id = $1', [userId]);

        // Render the user's profile information
        res.render('profile', { user: userProfile.rows[0] }); // Assuming there is a profile view/template

    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).send('An error occurred while fetching the user profile.');
    }
});

usersRouter.put('/profile', ensureAuthenticated, async (req, res) => {
    try {
        // Retrieve the user's ID from the authenticated user's session
        const userId = req.user.user_id;

        // Retrieve the new profile data from the request body
        const { newUsername, newPassword } = req.body;

        // Validate the new data
        if (!newUsername && !newPassword) {
            return res.status(400).send('No data provided for update.');
        }

        // Update the user's profile data in the database
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



module.exports = usersRouter;