// src/api/httpClient.js
import axios from "axios";

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }

  if (import.meta.env.VITE_NGROK_URL) {
    return `${import.meta.env.VITE_NGROK_URL}/api/v1`;
  }

  return "http://localhost:5128/api/v1";
};

const API_BASE_URL = getApiBaseUrl();

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

export const API_BASE = API_BASE_URL;
export default httpClient;
