// src/api/client.ts
import axios, { AxiosError } from "axios";

// Use environment variable or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      const message = (error.response.data as { detail?: string })?.detail || error.message;
      console.error(`API Error [${error.response.status}]:`, message);
    } else if (error.request) {
      // Request made but no response received
      console.error("API Error: No response received from server");
    } else {
      // Error in request setup
      console.error("API Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export { API_BASE_URL };
