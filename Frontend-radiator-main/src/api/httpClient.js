// src/api/httpClient.js
import axios from "axios";

// Smart API Base URL Detection
// Priority: VITE_API_BASE > VITE_NGROK_URL > localhost
const getApiBaseUrl = () => {
  // 1. Check if explicit API base is set
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }

  // 2. Check if Ngrok URL is set
  if (import.meta.env.VITE_NGROK_URL) {
    return `${import.meta.env.VITE_NGROK_URL}/api/v1`;
  }

  // 3. Default to localhost
  return "http://localhost:5128/api/v1";
};

const API_BASE_URL = getApiBaseUrl();

// Log which backend we're connecting to
console.log(`🔗 Connecting to API: ${API_BASE_URL}`);

const httpClient = axios.create({
  baseURL: API_BASE_URL,
});

let tokenProvider = null;

export function setAuthTokenProvider(provider) {
  tokenProvider = provider;
}

httpClient.interceptors.request.use((config) => {
  const token = tokenProvider?.();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    if (config.headers?.["Content-Type"]) {
      delete config.headers["Content-Type"];
    }
  } else {
    config.headers = config.headers || {};
    if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.VITE_DEBUG === "true") {
      console.log(
        "✅ API Success:",
        response.config.method?.toUpperCase(),
        response.config.url,
        response.status
      );
    }
    return response;
  },
  (error) => {
    if (import.meta.env.VITE_DEBUG === "true") {
      console.error(
        "❌ API Error:",
        error.config?.method?.toUpperCase(),
        error.config?.url,
        error.response?.status,
        error.response?.data || error.message
      );
    }
    return Promise.reject(error);
  }
);

export const API_BASE = API_BASE_URL;
export default httpClient;
