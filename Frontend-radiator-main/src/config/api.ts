const LOCAL_API_BASE = "http://localhost:5128/api/v1";

export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }

  if (import.meta.env.VITE_NGROK_URL) {
    return `${import.meta.env.VITE_NGROK_URL}/api/v1`;
  }

  return LOCAL_API_BASE;
};

export const API_BASE_URL = getApiBaseUrl();

export const getApiOrigin = () => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return "";
  }
};

export const API_ORIGIN = getApiOrigin();
