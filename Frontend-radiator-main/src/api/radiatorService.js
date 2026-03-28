// src/api/radiatorService.js
import httpClient from "./httpClient";
import { handleRequest } from "./apiHelpers";

const radiatorService = {
  create(radiatorData) {
    return handleRequest(
      () => httpClient.post("/radiators", radiatorData),
      { fallbackMessage: "Failed to create radiator" }
    );
  },

  getAll(sortBy = "createdAt", sortOrder = "asc") {
    const params = {};
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;

    return handleRequest(
      () => httpClient.get("/radiators", { params }),
      { fallbackMessage: "Failed to fetch radiators - check API connection" }
    );
  },

  getPaginated(pageNumber = 1, pageSize = 20) {
    const params = { pageNumber, pageSize };

    return handleRequest(
      () => httpClient.get("/radiators", { params }),
      { fallbackMessage: "Failed to fetch radiators - check API connection" }
    );
  },

  getById(id) {
    return handleRequest(
      () => httpClient.get(`/radiators/${id}`),
      { fallbackMessage: "Failed to fetch radiator - check API connection" }
    );
  },

  update(id, radiatorData) {
    return handleRequest(
      () => httpClient.put(`/radiators/${id}`, radiatorData),
      { fallbackMessage: "Failed to update radiator" }
    );
  },

  delete(id) {
    return handleRequest(
      () => httpClient.delete(`/radiators/${id}`),
      { fallbackMessage: "Failed to delete radiator" }
    );
  },
};

export default radiatorService;
