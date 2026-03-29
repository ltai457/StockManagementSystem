// src/api/radiatorService.js
import { compactObject, createCrudService } from "./apiHelpers";

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
};

export default radiatorService;
