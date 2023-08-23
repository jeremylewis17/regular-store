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
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the user into the PostgreSQL database
        await pool.query('INSERT INTO users (username, hashed_password) VALUES ($1, $2)', [username, hashedPassword]);

        res.redirect('/login');
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).send('Error creating user');
    }
});

module.exports = router;
