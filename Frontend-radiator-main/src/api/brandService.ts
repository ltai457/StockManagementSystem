import httpClient from "./httpClient";
import { handleRequest } from "./apiHelpers";
import type { NamedOption } from "../types";

const brandService = {
  getAll: () => handleRequest(() => httpClient.get<NamedOption[]>("/brands"), {
    fallbackMessage: "Failed to fetch brands",
  }),

  create: (name: string) => handleRequest(() =>
    httpClient.post<NamedOption>("/brands", { name: name.trim() }), {
    fallbackMessage: "Failed to create brand",
  }),

  update: (id: string, name: string) => handleRequest(() =>
    httpClient.put<NamedOption>(`/brands/${id}`, { name: name.trim() }), {
    fallbackMessage: "Failed to update brand",
  }),

  remove: (id: string) => handleRequest(() => httpClient.delete<void>(`/brands/${id}`), {
    fallbackMessage: "Failed to delete brand",
  }),
};

export default brandService;
