import axios, { AxiosHeaders } from "axios";
import { API_BASE_URL } from "../config/api";

type TokenProvider = () => string | null;
type UnauthorizedHandler = () => void;

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
});

let tokenProvider: TokenProvider | null = null;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setAuthTokenProvider(provider: TokenProvider | null): void {
  tokenProvider = provider;
}

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

httpClient.interceptors.request.use((config) => {
  const headers = AxiosHeaders.from(config.headers);
  const token = tokenProvider?.();

  if (token) headers.set("Authorization", `Bearer ${token}`);

  if (config.data instanceof FormData) {
    headers.delete("Content-Type");
  } else if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  config.headers = headers;
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) unauthorizedHandler?.();
    return Promise.reject(error);
  }
);

export const API_BASE = API_BASE_URL;
export default httpClient;
