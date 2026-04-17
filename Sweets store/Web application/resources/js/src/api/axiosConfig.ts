import axios, { InternalAxiosRequestConfig } from "axios";

const axiosConfig = axios.create({
  baseURL: "/api",
  headers: {
    Accept: "application/json",
  },
});

// Request Interceptor to attach Bearer Token
axiosConfig.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to send X-Locale header based on current language
axiosConfig.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Use 'localStorage.getItem("lang")' or a common state management value
  const lang = localStorage.getItem("lang") || "en";
  config.headers["X-Locale"] = lang;
  return config;
});

export default axiosConfig;
