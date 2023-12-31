const express = require('express');
const {pool} = require('./database');  // Import the PostgreSQL pool from database.js
const {passport, ensureAuthenticated, ensureManager} = require('./passport'); // Import the Passport configuration from passport.js
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

// PUT endpoint to restock an item by item_id
itemsRouter.put('/:item_id', ensureAuthenticated, ensureManager, async (req, res) => {
    try {
      const itemId = req.params.item_id;
      const { quantity } = req.body;
  
      // Validate input
      if (!quantity || isNaN(quantity) || quantity <= 0) {
        return res.status(400).send('Invalid quantity provided.');
      }
  
      // Check if the item exists
      const itemQuery = 'SELECT * FROM items WHERE item_id = $1';
      const itemResult = await pool.query(itemQuery, [itemId]);
  
      if (itemResult.rows.length === 0) {
        return res.status(404).send('Item not found.');
      }
  
      // Update the item's quantity
      const updateQuery = 'UPDATE items SET quantity = quantity + $1 WHERE item_id = $2';
      await pool.query(updateQuery, [quantity, itemId]);
  
      res.status(200).send('Item restocked successfully.');
    } catch (err) {
      console.error('Error restocking item:', err);
      res.status(500).send('An error occurred while restocking the item.');
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

itemsRouter.post('/', ensureAuthenticated, ensureManager, async (req, res) => {
    try {
        const { name, description, price, quantity } = req.body;

        // Validate input
        if (!name || !description || isNaN(price) || isNaN(quantity) || price <= 0 || quantity <= 0) {
            return res.status(400).send('Invalid item details provided.');
        }

        // Insert the new item into the database
        const insertQuery = `
            INSERT INTO items (name, description, price, quantity)
            VALUES ($1, $2, $3, $4)
            RETURNING item_id
        `;
        const result = await pool.query(insertQuery, [name, description, price, quantity]);

        // Return the ID of the newly created item
        const newItemId = result.rows[0].item_id;
        res.status(201).json({ item_id: newItemId, message: 'Item created successfully.' });
    } catch (err) {
        console.error('Error creating item:', err);
        res.status(500).send('An error occurred while creating the item.');
    }
});


module.exports = itemsRouter;