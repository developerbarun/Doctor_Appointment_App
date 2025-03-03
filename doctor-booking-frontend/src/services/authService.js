import axios from 'axios';

const API_URL = 'https://doctor-appointment-app-pi.vercel.app/api/auth';

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  } catch (error) {
    console.error('Login Error:', error.response?.data?.msg || error.message);
    throw error;
  }
};

export const registerUser = async (name, email, password, role) => {
  try {
    const response = await axios.post(`${API_URL}/register`, { name, email, password, role });
    return response.data;
  } catch (error) {
    console.error('Register Error:', error.response?.data?.msg || error.message);
    throw error;
  }
};
