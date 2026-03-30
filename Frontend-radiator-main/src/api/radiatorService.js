// src/api/radiatorService.js
import { compactObject, createCrudService, handleRequest } from "./apiHelpers";
import httpClient from "./httpClient";

const radiatorCrud = createCrudService("/radiators", {
  resourceName: "radiator",
  resourceNamePlural: "radiators",
  messages: {
    list: "Failed to fetch radiators",
    get: "Failed to fetch radiator",
    create: "Failed to create radiator",
    update: "Failed to update radiator",
    remove: "Failed to delete radiator",
  },
});

const radiatorService = {
  create: (radiatorData) => radiatorCrud.create(radiatorData),
  getAll: (sortBy = "createdAt", sortOrder = "asc") =>
    radiatorCrud.list(compactObject({ sortBy, sortOrder })),
  getPaginated: (pageNumber = 1, pageSize = 20) =>
    radiatorCrud.list({ pageNumber, pageSize }),
  getById: (id) => radiatorCrud.get(id),
  update: (id, radiatorData) => radiatorCrud.update(id, radiatorData),
  delete: (id) => radiatorCrud.remove(id),
  uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);

    return handleRequest(
      () =>
        httpClient.post("/radiators/upload-image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }),
      { fallbackMessage: "Failed to upload image" }
    );
  },
};

export default radiatorService;
