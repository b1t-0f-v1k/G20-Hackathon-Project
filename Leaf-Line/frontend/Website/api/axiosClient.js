// src/api/axiosClient.js
import axios from "axios";
import { getAuth } from "firebase/auth";

const axiosClient = axios.create({
  baseURL: "http://localhost:5000/api", // Your backend base URL
  headers: { "Content-Type": "application/json" },
});

// Add Firebase token automatically to every request
axiosClient.interceptors.request.use(async (config) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
