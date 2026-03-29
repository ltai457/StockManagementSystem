// src/api/stockService.js
import httpClient from "./httpClient";
import { compactObject, handleRequest, serializeDateParams } from "./apiHelpers";

const stockService = {
  getRadiatorStock(radiatorId) {
    return handleRequest(
      () => httpClient.get(`/radiators/${radiatorId}/stock`),
      { fallbackMessage: "Failed to fetch stock levels" }
    );
  },

  updateStock(radiatorId, warehouseCode, quantity) {
    return handleRequest(
      () =>
        httpClient.post(`/radiators/${radiatorId}/stock`, {
          warehouseCode: warehouseCode.toUpperCase(),
          quantity: parseInt(quantity, 10),
        }),
      { fallbackMessage: "Failed to update stock" }
    );
  },

  recordStockIn(payload = {}) {
    return handleRequest(
      () =>
        httpClient.post("/stock/in", {
          radiatorId: payload.radiatorId,
          warehouseCode: payload.warehouseCode?.toUpperCase(),
          quantity: Number.parseInt(payload.quantity, 10),
          reason: payload.reason,
        }),
      { fallbackMessage: "Failed to add stock" }
    );
  },

  transferStock(payload = {}) {
    return handleRequest(
      () =>
        httpClient.post("/stock/transfer", {
          radiatorId: payload.radiatorId,
          fromWarehouseCode: payload.fromWarehouseCode?.toUpperCase(),
          toWarehouseCode: payload.toWarehouseCode?.toUpperCase(),
          quantity: Number.parseInt(payload.quantity, 10),
          reason: payload.reason,
        }),
      { fallbackMessage: "Failed to transfer stock" }
    );
  },

  recordSale(payload = {}) {
    return handleRequest(
      () =>
        httpClient.post("/stock/sell", {
          radiatorId: payload.radiatorId,
          warehouseCode: payload.warehouseCode?.toUpperCase(),
          quantity: Number.parseInt(payload.quantity, 10),
          reason: payload.reason,
        }),
      { fallbackMessage: "Failed to record sale" }
    );
  },

  getStockMovements(params = {}) {
    return handleRequest(
      () =>
        httpClient.get("/stock/movements", {
          params: compactObject(serializeDateParams(params)),
        }),
      { fallbackMessage: "Failed to fetch stock movements" }
    );
  },

  getAllRadiatorsWithStock(search = null, lowStockOnly = false, warehouseCode = null) {
    return handleRequest(
      () =>
        httpClient.get("/stock/all-radiators", {
          params: compactObject({
            search,
            lowStockOnly: lowStockOnly ? "true" : undefined,
            warehouseCode,
          }),
        }),
      { fallbackMessage: "Failed to fetch radiators with stock" }
    );
  },

  getStockSummary() {
    return handleRequest(
      () => httpClient.get("/stock/summary"),
      { fallbackMessage: "Failed to fetch stock summary" }
    );
  },

  getAllRadiatorsWithStockPaginated(pageNumber = 1, pageSize = 21, search = null, lowStockOnly = false, warehouseCode = null) {
    return handleRequest(
      () =>
        httpClient.get("/stock/all-radiators", {
          params: compactObject({
            pageNumber,
            pageSize,
            search,
            lowStockOnly: lowStockOnly ? "true" : undefined,
            warehouseCode,
          }),
        }),
      { fallbackMessage: "Failed to fetch radiators with stock" }
    );
  },

  getStockMovementsPaginated(pageNumber = 1, pageSize = 21, params = {}) {
    return handleRequest(
      () =>
        httpClient.get("/stock/movements", {
          params: compactObject(
            serializeDateParams({
              ...params,
              pageNumber,
              pageSize,
            })
          ),
        }),
      { fallbackMessage: "Failed to fetch stock movements" }
    );
  },
};

export default stockService;
