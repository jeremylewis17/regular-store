const express = require('express');
const {pool} = require('./database');  // Import the PostgreSQL pool from database.js
const {passport, ensureAuthenticated} = require('./passport'); // Import the Passport configuration from passport.js
const bcrypt = require('bcrypt');

const cartsRouter = express.Router();






module.exports = cartsRouter;