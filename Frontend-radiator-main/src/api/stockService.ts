import httpClient from "./httpClient";
import { compactObject, handleRequest, serializeDateParams } from "./apiHelpers";
import type { PagedResult, QueryParams } from "../types/api";
import type {
  Radiator,
  StockMovement,
  StockMutationPayload,
  StockSummary,
  StockTransferPayload,
} from "../types";

type MutationResponse = Record<string, unknown>;

const toInteger = (value: number | string): number => Number.parseInt(String(value), 10);

const stockService = {
  getRadiatorStock: (radiatorId: string) => handleRequest(() =>
    httpClient.get<{ stock: Record<string, number> }>(`/radiators/${radiatorId}/stock`), {
    fallbackMessage: "Failed to fetch stock levels",
  }),

  updateStock: (radiatorId: string, warehouseCode: string, quantity: number | string) =>
    handleRequest(() => httpClient.post<MutationResponse>(`/radiators/${radiatorId}/stock`, {
      warehouseCode: warehouseCode.toUpperCase(),
      quantity: toInteger(quantity),
    }), { fallbackMessage: "Failed to update stock" }),

  recordStockIn: (payload: StockMutationPayload) => handleRequest(() =>
    httpClient.post<MutationResponse>("/stock/in", {
      ...payload,
      warehouseCode: payload.warehouseCode.toUpperCase(),
      quantity: toInteger(payload.quantity),
    }), { fallbackMessage: "Failed to add stock" }),

  transferStock: (payload: StockTransferPayload) => handleRequest(() =>
    httpClient.post<MutationResponse>("/stock/transfer", {
      ...payload,
      fromWarehouseCode: payload.fromWarehouseCode.toUpperCase(),
      toWarehouseCode: payload.toWarehouseCode.toUpperCase(),
      quantity: toInteger(payload.quantity),
    }), { fallbackMessage: "Failed to transfer stock" }),

  recordSale: (payload: StockMutationPayload) => handleRequest(() =>
    httpClient.post<MutationResponse>("/stock/sell", {
      ...payload,
      warehouseCode: payload.warehouseCode.toUpperCase(),
      quantity: toInteger(payload.quantity),
    }), { fallbackMessage: "Failed to record sale" }),

  getStockMovements: (params: QueryParams = {}) => handleRequest(() =>
    httpClient.get<StockMovement[]>("/stock/movements", {
      params: compactObject(serializeDateParams(params)),
    }), { fallbackMessage: "Failed to fetch stock movements" }),

  getAllRadiatorsWithStock: (
    search: string | null = null,
    lowStockOnly = false,
    warehouseCode: string | null = null
  ) => handleRequest(() => httpClient.get<Radiator[]>("/stock/all-radiators", {
    params: compactObject({
      search,
      lowStockOnly: lowStockOnly ? "true" : undefined,
      warehouseCode,
    }),
  }), { fallbackMessage: "Failed to fetch radiators with stock" }),

  getStockSummary: () => handleRequest(() => httpClient.get<StockSummary>("/stock/summary"), {
    fallbackMessage: "Failed to fetch stock summary",
  }),

  getAllRadiatorsWithStockPaginated: (
    pageNumber = 1,
    pageSize = 21,
    search: string | null = null,
    lowStockOnly = false,
    warehouseCode: string | null = null
  ) => handleRequest(() => httpClient.get<PagedResult<Radiator>>("/stock/all-radiators", {
    params: compactObject({
      pageNumber,
      pageSize,
      search,
      lowStockOnly: lowStockOnly ? "true" : undefined,
      warehouseCode,
    }),
  }), { fallbackMessage: "Failed to fetch radiators with stock" }),

  getStockMovementsPaginated: (
    pageNumber = 1,
    pageSize = 21,
    params: QueryParams = {}
  ) => handleRequest(() => httpClient.get<PagedResult<StockMovement>>("/stock/movements", {
    params: compactObject(serializeDateParams({ ...params, pageNumber, pageSize })),
  }), { fallbackMessage: "Failed to fetch stock movements" }),
};

export default stockService;
