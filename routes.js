const express = require('express');
const usersRouter = require('./users');
const itemsRouter = require('./items');
const cartsRouter = require('./carts');
const ordersRouter = require('./orders');

const apiRouter = express.Router();


apiRouter.use('/users', usersRouter);
apiRouter.use('/items', itemsRouter);
apiRouter.use('/carts', cartsRouter);
apiRouter.use('/orders', ordersRouter);


module.exports = apiRouter;
