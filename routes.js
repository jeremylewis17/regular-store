const express = require('express');
const passport = require('./passport'); // Import the Passport configuration from passport.js
const bcrypt = require('bcrypt');
const { pool } = require('./database'); // Import the PostgreSQL pool from database.js

const router = express.Router();

router.get('/login', (req, res, next) => {
    res.render('login');
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('profile');
});

router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Validation
        if (!username || !password) {
            return res.status(400).send('Username and password are required.');
        }

        // Check if the username is within the desired length range
        if (username.length < 4 || username.length > 20) {
            return res.status(400).send('Username must be between 4 and 20 characters.');
        }

        // Check if the password is within the desired length range
        if (password.length < 8 || password.length > 30) {
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


module.exports = router;
