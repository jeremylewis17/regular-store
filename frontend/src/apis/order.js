import API from './client';

// API interface for loading a user's orders
export const fetchOrders = async () => {
  try {
    const response = await API.get(`orders`);

    return response.data;

  } catch (err) {
    throw err.response.data;
  }
}

// API interface for loading a user's order by order ID
export const fetchOrder = async (order_id) => {
  try {
    const response = await API.get(`orders/${order_id}`);

    return response.data;

  } catch(err) {
    throw err.response.data;
  }
}

