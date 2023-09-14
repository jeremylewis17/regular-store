import API from './client';

// API interface for loading the user's cart
export const fetchCart = async (user_id) => {
  try {
    const response = await API.get(`carts/${user_id}`);

    return response.data;

  } catch (err) {
    throw err.response.data;
  }
}

// API interface for adding a product to a user's cart
export const addToCart = async (user_id, item_id, quantity) => {
  try {
    const response = await API.put(`carts/${user_id}`, { item_id, quantity });

    return response.data;

  } catch(err) {
    throw err.response.data;
  }
}

// API interface for removing a product from a user's cart
export const removeFromCart = async (user_id, item_id) => {
  try {
    const response = await API.delete(`carts/${user_id}`, { data: { item_id } });

    return response.data;

  } catch(err) {
    throw err.response.data;
  }
}

// API interface for checking out a user's cart
export const checkout = async (user_id) => {
  try {
    const response = await API.post(`carts/${user_id}/checkout`);

    return response.data;

  } catch(err) {
    throw err.response.data;
  }
}