const express = require('express');
const {pool} = require('./database');  // Import the PostgreSQL pool from database.js
const {passport, ensureAuthenticated} = require('./passport'); // Import the Passport configuration from passport.js
const bcrypt = require('bcrypt');

const cartsRouter = express.Router();


// Get a user's cart
cartRouter.get('/:user_id', ensureAuthenticated, async (req, res) => {
    try {
        const userId = req.params.user_id;
        const userCart = await pool.query('SELECT items.name, items.description, items.price, cart.quantity FROM cart JOIN items ON cart.item_id = items.item_id WHERE cart.user_id = $1', [userId]);

        if (userCart.rows.length === 0) {
            return res.status(404).send('Cart not found.');
        }
        // Send the user's cart information as JSON
        res.status(200).json(userCart.rows);
    } catch (err) {
        console.error('Error fetching user cart:', err);
        res.status(500).send('An error occurred while fetching the user cart.');
    }
});

// Add an item to the cart
cartRouter.put('/:user_id', ensureAuthenticated, async (req, res) => {
    try {
        const userId = req.params.user_id;
        const { itemId, quantity } = req.body;

        // Validate the request body
        if (!itemId || !quantity) {
            return res.status(400).send('Item ID and quantity are required.');
        }
        // Check if the item exists
        const item = await pool.query('SELECT * FROM items WHERE item_id = $1', [itemId]);

        if (item.rows.length === 0) {
            return res.status(404).send('Item not found.');
        }

        await pool.query('INSERT INTO cart (user_id, item_id, quantity) VALUES ($1, $2, $3) ON CONFLICT (user_id, item_id) DO UPDATE SET quantity = $3', [userId, itemId, quantity]);

        res.status(200).send('Item added to cart successfully.');
    } catch (err) {
        console.error('Error adding item to cart:', err);
        res.status(500).send('An error occurred while adding the item to the cart.');
    }
});

// Delete an item from the cart
cartRouter.delete('/:user_id', ensureAuthenticated, async (req, res) => {
    try {
        const userId = req.params.user_id;
        const { item_Id } = req.body;

        // Validate the request body
        if (!item_Id) {
            return res.status(400).send('Item ID is required.');
        }

        await pool.query('DELETE FROM cart WHERE user_id = $1 AND item_id = $2', [userId, item_Id]);

        res.status(200).send('Item removed from cart successfully.');
    } catch (err) {
        console.error('Error removing item from cart:', err);
        res.status(500).send('An error occurred while removing the item from the cart.');
    }
});

cartRouter.post('/:user_id/checkout', ensureAuthenticated, async (req, res) => {
    try {
        const userId = req.params.user_id;
        const client = await pool.connect();
        await client.query('BEGIN');

        try {
            // Retrieve the user's cart items and calculate the total price
            const cartItemsQuery = `
                SELECT items.item_id, items.price, cart.quantity
                FROM cart
                JOIN items ON cart.item_id = items.item_id
                WHERE cart.user_id = $1
            `;
            const cartItemsResult = await client.query(cartItemsQuery, [userId]);

            if (cartItemsResult.rows.length === 0) {
                throw new Error('Cart is empty.');
            }

            let totalAmount = 0;
            const orderItems = [];

            // Calculate the total price and prepare order items
            cartItemsResult.rows.forEach((row) => {
                const { item_id, price, quantity } = row;
                totalAmount += price * quantity;
                orderItems.push({ item_id, quantity });
            });

            // Create an order in the orders table
            const createOrderQuery = `
                INSERT INTO orders (user_id, total_price)
                VALUES ($1, $2)
                RETURNING order_id
            `;
            const createOrderResult = await client.query(createOrderQuery, [userId, totalAmount]);
            const orderId = createOrderResult.rows[0].order_id;

            // Insert order items into the orders_items table
            for (const { item_id, quantity } of orderItems) {
                const insertOrderItemQuery = `
                    INSERT INTO orders_items (order_id, item_id, quantity)
                    VALUES ($1, $2, $3)
                `;
                await client.query(insertOrderItemQuery, [orderId, item_id, quantity]);
            }

            //Clear the user's cart
            const clearCartQuery = `
                DELETE FROM cart
                WHERE user_id = $1
            `;
            await client.query(clearCartQuery, [userId]);

            // Commit the transaction
            await client.query('COMMIT');

            // Perform payment processing logic here later

            res.status(200).send('Cart checkout completed successfully.');
        } catch (err) {
            // If any error occurs during the transaction, rollback the changes
            await client.query('ROLLBACK');
            throw err;
        } finally {
            // Release the client back to the pool
            client.release();
        }
    } catch (err) {
        console.error('Error during cart checkout:', err);
        res.status(500).send('An error occurred during cart checkout.');
    }
});


module.exports = cartRouter;



module.exports = cartsRouter;