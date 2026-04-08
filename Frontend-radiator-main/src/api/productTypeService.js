import httpClient from "./httpClient";
import { handleRequest } from "./apiHelpers";

const productTypeService = {
  getAll() {
    return handleRequest(
      () => httpClient.get("/product-types"),
      { fallbackMessage: "Failed to fetch product types" }
    );
  },

  create(name) {
    return handleRequest(
      () => httpClient.post("/product-types", { name: name?.trim() }),
      { fallbackMessage: "Failed to create product type" }
    );
  },

  update(id, name) {
    return handleRequest(
      () => httpClient.put(`/product-types/${id}`, { name: name?.trim() }),
      { fallbackMessage: "Failed to update product type" }
    );
  },

  remove(id) {
    return handleRequest(
      () => httpClient.delete(`/product-types/${id}`),
      { fallbackMessage: "Failed to delete product type" }
    );
  },
};

export default productTypeService;
