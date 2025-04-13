import axios from 'axios';

// Create an Axios instance with a predefined base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // Your base URL
});

// You can add any additional configuration here, such as interceptors, headers, etc.
// api.defaults.headers.common['Authorization'] = `Bearer YOUR_ACCESS_TOKEN`;

export default api;
