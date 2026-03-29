// src/api/warehouseService.js
import httpClient from "./httpClient";
import { compactObject, createCrudService, handleRequest } from "./apiHelpers";

const warehouseCrud = createCrudService("/warehouses", {
  resourceName: "warehouse",
  resourceNamePlural: "warehouses",
  messages: {
    list: "Failed to fetch warehouses",
    get: "Failed to fetch warehouse",
    create: "Failed to create warehouse",
    update: "Failed to update warehouse",
    remove: "Failed to delete warehouse",
  },
});

const toWarehousePayload = (warehouseData = {}) =>
  compactObject({
    name: warehouseData.name?.trim(),
    code: warehouseData.code?.trim()?.toUpperCase(),
    location: warehouseData.location?.trim(),
    address: warehouseData.address?.trim(),
    phone: warehouseData.phone?.trim(),
    email: warehouseData.email?.trim(),
  });

const warehouseService = {
  getAll: (params) => warehouseCrud.list(params),
  getById: (id) => warehouseCrud.get(id),
  getByCode: (code) =>
    handleRequest(
      () => httpClient.get(`/warehouses/code/${code}`),
      { fallbackMessage: "Failed to fetch warehouse by code" }
    ),
  create: (warehouseData) => warehouseCrud.create(toWarehousePayload(warehouseData)),
  update: (id, warehouseData) => warehouseCrud.update(id, toWarehousePayload(warehouseData)),
  delete: (id) => warehouseCrud.remove(id),
};

export default warehouseService;
