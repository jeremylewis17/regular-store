import API from './client';

// API interface for loading products
export const fetchProducts = async () => {
  try {
    const response = await API.get(`items`);

    return response.data;

  } catch (err) {
    throw err.response.data;
  }
}

// API interface for loading a product by product ID
export const fetchProduct = async (item_id) => {
  try {
    const response = await API.get(`items/${item_id}`);
    
    return response.data;
  } catch(err) {
    throw err.response.data;
  }
}