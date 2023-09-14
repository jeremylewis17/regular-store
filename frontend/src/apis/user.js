import API from './client';


// API interface for loading the user's profile
export const fetchUser = async (user_id) => {
  try {
    const response = await API.post(`users/${user_id}`);

    return response.data;

  } catch (err) {
    throw err.response.data;
  }
}

// API interface for updating the user's profile
export const updateUser = async (user_id, newUsername, newPassword) => {
  try {
    const response = await API.post(`users/${user_id}`, { newUsername, newPassword });

    return response.data;

  } catch(err) {
    throw err.response.data;
  }
}

// API interface for logging a user in
export const loginUser = async (credentials) => {
  try {
    const response = await API.post('users/login', credentials);

    return response.data;

  } catch (err) {
    throw err.response.data;
  }
}

// API interface for registering a user
export const registerUser = async (data) => {
  try {
    const response = await API.post('users/register', data);

    return response.data;

  } catch(err) {
    throw err.response.data;
  }
}