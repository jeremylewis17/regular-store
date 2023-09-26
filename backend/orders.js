const express = require('express');
const {pool} = require('./database');  // Import the PostgreSQL pool from database.js
const {passport, ensureAuthenticated, ensureManager} = require('./passport'); // Import the Passport configuration from passport.js
const bcrypt = require('bcrypt');

const ordersRouter = express.Router();

// GET all orders for the authenticated user
ordersRouter.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const ordersQuery = 'SELECT * FROM orders WHERE user_id = $1 ORDER BY order_date DESC';
    const ordersResult = await pool.query(ordersQuery, [userId]);

    res.status(200).json(ordersResult.rows);
  } catch (err) {
    console.error('Error retrieving orders:', err);
    res.status(500).send('An error occurred while retrieving orders.');
  }
});

// GET a specific order by order_id for the authenticated user
ordersRouter.get('/:order_id', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const orderId = req.params.order_id;

    const orderQuery = 'SELECT * FROM orders WHERE user_id = $1 AND order_id = $2';
    const orderResult = await pool.query(orderQuery, [userId, orderId]);

    if (orderResult.rows.length === 0) {
      return res.status(404).send('Order not found.');
    }

    res.status(200).json(orderResult.rows[0]);
  } catch (err) {
    console.error('Error retrieving order:', err);
    res.status(500).send('An error occurred while retrieving the order.');
  }
});

// DELETE a specific order by order_id for the authenticated user
ordersRouter.delete('/:order_id', ensureAuthenticated, ensureManager, async (req, res) => {
  try {
    const orderId = req.params.order_id;

    const deleteOrderQuery = 'DELETE FROM orders WHERE order_id = $1';
    const deleteResult = await pool.query(deleteOrderQuery, [orderId]);

    if (deleteResult.rowCount === 0) {
      return res.status(404).send('Order not found');
    }

    res.status(200).send('Order deleted successfully.');
  } catch (err) {
    console.error('Error deleting order:', err);
    res.status(500).send('An error occurred while deleting the order.');
  }
});




module.exports = ordersRouter;