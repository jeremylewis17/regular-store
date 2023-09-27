require('dotenv').config(); 
const express = require('express');
const {pool} = require('./database');  // Import the PostgreSQL pool from database.js
const {passport, ensureAuthenticated, ensureAuthorized} = require('./passport'); // Import the Passport configuration from passport.js
const bcrypt = require('bcrypt');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const cartsRouter = express.Router();


// Get a user's cart
cartsRouter.get('/:user_id', ensureAuthenticated, ensureAuthorized, async (req, res) => {
    try {
        const userId = req.params.user_id;
        const userCart = await pool.query('SELECT items.item_id, items.name, items.description, items.price, cart.quantity FROM cart JOIN items ON cart.item_id = items.item_id WHERE cart.user_id = $1', [userId]);

        if (userCart.rows.length === 0) {
            return res.status(200).json({empty: true});
        }
        // Send the user's cart information as JSON
        res.status(200).json(userCart.rows);
    } catch (err) {
        console.error('Error fetching user cart:', err);
        res.status(500).send('An error occurred while fetching the user cart.');
    }
});

// Add an item to the cart
cartsRouter.put('/:user_id', ensureAuthenticated, ensureAuthorized, async (req, res) => {
    try {
        const userId = req.params.user_id;
        const { item_id, quantity } = req.body;

        // Validate the request body
        if (!item_id || !quantity) {
            return res.status(400).send('Item ID and quantity are required.');
        }

        // Check if the item exists
        const itemResult = await pool.query('SELECT * FROM items WHERE item_id = $1', [item_id]);

        if (itemResult.rows.length === 0) {
            return res.status(404).send('Item not found.');
        }

        const item = itemResult.rows[0];

        // Check if the requested quantity is available
        if (quantity > item.quantity) {
            return res.status(400).send('Requested quantity exceeds available stock.');
        }

        // Insert the item into the cart
        await pool.query('INSERT INTO cart (user_id, item_id, quantity) VALUES ($1, $2, $3) ON CONFLICT (user_id, item_id) DO UPDATE SET quantity = $3', [userId, item_id, quantity]);

        res.status(200).send('Item added to cart successfully.');
    } catch (err) {
        console.error('Error adding item to cart:', err);
        res.status(500).send('An error occurred while adding the item to the cart.');
    }
});


// Delete an item from the cart
cartsRouter.delete('/:user_id', ensureAuthenticated, ensureAuthorized, async (req, res) => {
    try {
        const userId = req.params.user_id;
        const { item_id } = req.body;

        // Validate the request body
        if (!item_id) {
            return res.status(400).send('Item ID is required.');
        }

        await pool.query('DELETE FROM cart WHERE user_id = $1 AND item_id = $2', [userId, item_id]);

        res.status(200).send('Item removed from cart successfully.');
    } catch (err) {
        console.error('Error removing item from cart:', err);
        res.status(500).send('An error occurred while removing the item from the cart.');
    }
});

cartsRouter.post('/checkout/db/:user_id', ensureAuthenticated, ensureAuthorized, async (req, res) => {
    const userId = req.params.user_id;
    const { id } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
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

        const totalAmountPennies = totalAmount * 100;

        // Check item quantities before reducing
        for (const { item_id, quantity } of orderItems) {
            const checkItemQuantityQuery = `
                SELECT quantity FROM items WHERE item_id = $1
            `;
            const checkItemResult = await client.query(checkItemQuantityQuery, [item_id]);

            if (checkItemResult.rows.length === 0) {
                throw new Error('Item not found.');
            }

            const currentQuantity = checkItemResult.rows[0].quantity;

            if (currentQuantity < quantity) {
                throw new Error('Insufficient quantity in store.');
            }
        }

        // Reduce item stock in items table
        for (const { item_id, quantity } of orderItems) {
            const updateItemQuantityQuery = `
                UPDATE items
                SET quantity = quantity - $2
                WHERE item_id = $1
            `;
            await client.query(updateItemQuantityQuery, [item_id, quantity]);
        }

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

        // Clear the user's cart
        const clearCartQuery = `
            DELETE FROM cart
            WHERE user_id = $1
        `;
        await client.query(clearCartQuery, [userId]);

        await client.query('COMMIT');
        res.status(200).send({ message: 'Database operations successful' });
    } catch (err) {
        // If any error occurs during the transaction, rollback the changes
        await client.query('ROLLBACK');
        console.error('Error during cart checkout:', err);
        res.status(500).send('An error occurred during cart checkout: ' + err.message);
    } finally {
        // Release the client back to the pool
        client.release();
    }
    });


    cartsRouter.post('/checkout/stripe/:user_id', ensureAuthenticated, ensureAuthorized, async (req, res) => {
        const userId = req.params.user_id;
    
        try {
        const cartItemsQuery = `
            SELECT items.item_id, items.price, cart.quantity
            FROM cart
            JOIN items ON cart.item_id = items.item_id
            WHERE cart.user_id = $1`;
        const cartItemsResult = await pool.query(cartItemsQuery, [userId]);

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

        const totalAmountPennies = totalAmount * 100;

            const payment = await stripe.paymentIntents.create({
            amount: totalAmountPennies,
            currency: "cad",
            automatic_payment_methods: {
                enabled: true,
              },
        });
        res.status(200).send({
            clientSecret: payment.client_secret,
          });
         } catch (err) {
            
        console.error('Error during stripe checkout:', err);
        res.status(500).send('An error occurred during stripe checkout: ' + err.message);
         }

    });
    


module.exports = cartsRouter;