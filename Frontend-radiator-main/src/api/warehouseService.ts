import type { AxiosRequestConfig } from "axios";
import httpClient from "./httpClient";
import { compactObject, handleRequest } from "./apiHelpers";
import type { Warehouse, WarehousePayload } from "../types";

const toWarehousePayload = (warehouse: Partial<WarehousePayload>): Partial<WarehousePayload> =>
  compactObject({
    name: warehouse.name?.trim(),
    code: warehouse.code?.trim().toUpperCase(),
    location: warehouse.location?.trim(),
    address: warehouse.address?.trim(),
    phone: warehouse.phone?.trim(),
    email: warehouse.email?.trim(),
  });

const warehouseService = {
  getAll: (config: AxiosRequestConfig = {}) => handleRequest(() =>
    httpClient.get<Warehouse[]>("/warehouses", config), {
    fallbackMessage: "Failed to fetch warehouses",
  }),

  getById: (id: string) => handleRequest(() =>
    httpClient.get<Warehouse>(`/warehouses/${id}`), {
    fallbackMessage: "Failed to fetch warehouse",
  }),

  getByCode: (code: string) => handleRequest(() =>
    httpClient.get<Warehouse>(`/warehouses/code/${encodeURIComponent(code)}`), {
    fallbackMessage: "Failed to fetch warehouse by code",
  }),

  create: (warehouse: WarehousePayload) => handleRequest(() =>
    httpClient.post<Warehouse>("/warehouses", toWarehousePayload(warehouse)), {
    fallbackMessage: "Failed to create warehouse",
  }),

  update: (id: string, warehouse: Partial<WarehousePayload>) => handleRequest(() =>
    httpClient.put<Warehouse>(`/warehouses/${id}`, toWarehousePayload(warehouse)), {
    fallbackMessage: "Failed to update warehouse",
  }),

  delete: (id: string) => handleRequest(() => httpClient.delete<void>(`/warehouses/${id}`), {
    fallbackMessage: "Failed to delete warehouse",
  }),
};

export default warehouseService;
