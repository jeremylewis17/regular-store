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
export const loginUser = async (username, password) => {
  try {
    const response = await API.post('users/login', { username, password });

    return response.data;

  } catch (err) {
    throw err.response.data;
  }
}

// API interface for registering a user
export const registerUser = async (username, password) => {
  try {
    const response = await API.post('users/register', { username, password });

    return response.data;

  } catch(err) {
    throw err.response.data;
  }
}

//API interface for logging a user out
export const logoutUser = async () => {
  try {
    const response = await API.get('users/logout');

    return response.data;
  } catch(err) {
    throw err.response.data;
  }
}