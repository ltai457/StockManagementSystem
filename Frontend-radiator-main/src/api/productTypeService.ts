import httpClient from "./httpClient";
import { handleRequest } from "./apiHelpers";
import type { NamedOption } from "../types";

const productTypeService = {
  getAll: () => handleRequest(() => httpClient.get<NamedOption[]>("/product-types"), {
    fallbackMessage: "Failed to fetch product types",
  }),

  create: (name: string) => handleRequest(() =>
    httpClient.post<NamedOption>("/product-types", { name: name.trim() }), {
    fallbackMessage: "Failed to create product type",
  }),

  update: (id: string, name: string) => handleRequest(() =>
    httpClient.put<NamedOption>(`/product-types/${id}`, { name: name.trim() }), {
    fallbackMessage: "Failed to update product type",
  }),

  remove: (id: string) => handleRequest(() => httpClient.delete<void>(`/product-types/${id}`), {
    fallbackMessage: "Failed to delete product type",
  }),
};

export default productTypeService;
