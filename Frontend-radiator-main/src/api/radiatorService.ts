import { compactObject, handleRequest } from "./apiHelpers";
import httpClient from "./httpClient";
import type { PagedResult } from "../types/api";
import type { CreateRadiatorPayload, Radiator } from "../types";

interface ImageUploadResponse {
  imageUrl: string;
  fileName: string;
}

const radiatorService = {
  create: (payload: CreateRadiatorPayload) => handleRequest(() =>
    httpClient.post<Radiator>("/radiators", payload), {
    fallbackMessage: "Failed to create radiator",
  }),

  getAll: (sortBy = "createdAt", sortOrder = "asc") => handleRequest(() =>
    httpClient.get<Radiator[]>("/radiators", {
      params: compactObject({ sortBy, sortOrder }),
    }), {
    fallbackMessage: "Failed to fetch radiators",
  }),

  getPaginated: (pageNumber = 1, pageSize = 20) => handleRequest(() =>
    httpClient.get<PagedResult<Radiator>>("/radiators", {
      params: { pageNumber, pageSize },
    }), {
    fallbackMessage: "Failed to fetch radiators",
  }),

  getById: (id: string) => handleRequest(() =>
    httpClient.get<Radiator>(`/radiators/${id}`), {
    fallbackMessage: "Failed to fetch radiator",
  }),

  update: (id: string, payload: Partial<CreateRadiatorPayload>) => handleRequest(() =>
    httpClient.put<Radiator>(`/radiators/${id}`, payload), {
    fallbackMessage: "Failed to update radiator",
  }),

  delete: (id: string) => handleRequest(() => httpClient.delete<void>(`/radiators/${id}`), {
    fallbackMessage: "Failed to delete radiator",
  }),

  uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    return handleRequest(() =>
      httpClient.post<ImageUploadResponse>("/radiators/upload-image", formData), {
      fallbackMessage: "Failed to upload image",
    });
  },
};

export default radiatorService;
