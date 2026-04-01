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
};

export default productTypeService;
