import axios from "axios";
import Cookies from "js-cookie";

// Create an Axios instance with a predefined base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // Your base URL
  withCredentials: true, // This sends cookies!
});

// Add access token to request headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const removeAllCookies = () => {
  const allCookies = Cookies.get();
  console.log("Removing cookies All cookies");
  for (const cookie in allCookies) {
    console.log(`Removing cookie: ${cookie}`);
    Cookies.remove(cookie);
  }
  console.log("All cookies have been removed!");
};

// Automatically refresh token on 403 errors and Go to login page if refresh fails or 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;


    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        removeAllCookies();

        // Check if the token was not send then redirect to login page
        if (typeof window !== "undefined") window.location.href = "/sign-in";
        console.log("Got 403 error, redirecting to login page");
        console.log("refresherror", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
