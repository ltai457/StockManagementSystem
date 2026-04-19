import httpClient from "./httpClient";
import { handleRequest } from "./apiHelpers";

const brandService = {
  getAll() {
    return handleRequest(
      () => httpClient.get("/brands"),
      { fallbackMessage: "Failed to fetch brands" }
    );
  },

  create(name) {
    return handleRequest(
      () => httpClient.post("/brands", { name: name?.trim() }),
      { fallbackMessage: "Failed to create brand" }
    );
  },

  update(id, name) {
    return handleRequest(
      () => httpClient.put(`/brands/${id}`, { name: name?.trim() }),
      { fallbackMessage: "Failed to update brand" }
    );
  },

  remove(id) {
    return handleRequest(
      () => httpClient.delete(`/brands/${id}`),
      { fallbackMessage: "Failed to delete brand" }
    );
  },
};

export default brandService;
