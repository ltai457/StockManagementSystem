import httpClient from "./httpClient";
import { handleRequest } from "./apiHelpers";
import type { CreateUserPayload, UpdateUserPayload, User } from "../types";

const userService = {
  getAllUsers: (params?: Record<string, unknown>) => handleRequest(() =>
    httpClient.get<User[]>("/users", { params }), {
    fallbackMessage: "Failed to fetch users",
  }),

  getUserById: (id: string) => handleRequest(() => httpClient.get<User>(`/users/${id}`), {
    fallbackMessage: "Failed to fetch user",
  }),

  createUser: (payload: CreateUserPayload) => handleRequest(() =>
    httpClient.post<User>("/users", payload), {
    fallbackMessage: "Failed to create user",
  }),

  updateUser: (id: string, payload: UpdateUserPayload) => handleRequest(() =>
    httpClient.put<User>(`/users/${id}`, payload), {
    fallbackMessage: "Failed to update user",
  }),

  deleteUser: (id: string) => handleRequest(() => httpClient.delete<void>(`/users/${id}`), {
    fallbackMessage: "Failed to delete user",
  }),

  checkUsernameExists: (username: string) => handleRequest(
    () => httpClient.get<{ exists: boolean }>(`/users/check-username/${encodeURIComponent(username)}`),
    { fallbackMessage: "Failed to check username", mapData: (data) => data.exists }
  ),

  checkEmailExists: (email: string) => handleRequest(
    () => httpClient.get<{ exists: boolean }>(`/users/check-email/${encodeURIComponent(email)}`),
    { fallbackMessage: "Failed to check email", mapData: (data) => data.exists }
  ),
};

export default userService;
