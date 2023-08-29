const express = require('express');
const {pool} = require('./database');  // Import the PostgreSQL pool from database.js
const {passport, ensureAuthenticated} = require('./passport'); // Import the Passport configuration from passport.js
const bcrypt = require('bcrypt');

const itemsRouter = express.Router();

itemsRouter.get('/:item_id', async (req, res) => {
    try {
        const itemId = req.params.item_id;

        // Retrieve the item from the database based on item_id
        const item = await pool.query('SELECT * FROM items WHERE item_id = $1', [itemId]);

        if (item.rows.length === 0) {
            return res.status(404).send('Item not found.');
        }
        // Send the item as JSON
        res.status(200).json(item.rows[0]);
    } catch (err) {
        console.error('Error fetching item:', err);
        res.status(500).send('An error occurred while fetching the item.');
    }
});

itemsRouter.get('/', async (req, res) => {
    try {
        // Retrieve all items from the database
        const allItems = await pool.query('SELECT * FROM items');

        // Send the list of items as JSON
        res.status(200).json(allItems.rows);
    } catch (err) {
        console.error('Error fetching items:', err);
        res.status(500).send('An error occurred while fetching items.');
    }
});

module.exports = itemsRouter;