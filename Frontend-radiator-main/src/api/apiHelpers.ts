import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import httpClient from "./httpClient";
import type { ApiResult, QueryParams, QueryValue } from "../types/api";

interface ErrorPayload {
  message?: string;
  errors?: string | string[] | Record<string, string | string[]>;
}

export function resolveErrorMessage(error: unknown, fallbackMessage = "Request failed"): string {
  if (!axios.isAxiosError<ErrorPayload>(error)) {
    return error instanceof Error ? error.message : fallbackMessage;
  }

  const responseData = error.response?.data;
  if (responseData?.message) return responseData.message;

  if (responseData?.errors) {
    const { errors } = responseData;
    if (typeof errors === "string") return errors;
    if (Array.isArray(errors)) return errors.join(", ");

    const formatted = Object.entries(errors).map(([field, messages]) =>
      `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`
    );
    if (formatted.length) return formatted.join("; ");
  }

  if (typeof responseData === "string") return responseData;
  return error.message || fallbackMessage;
}

interface RequestOptions<TResponse, TData> {
  fallbackMessage?: string;
  mapData?: (data: TResponse, response: AxiosResponse<TResponse>) => TData;
}

export async function handleRequest<TResponse, TData = TResponse>(
  factory: () => Promise<AxiosResponse<TResponse>>,
  options: RequestOptions<TResponse, TData> = {}
): Promise<ApiResult<TData>> {
  const { fallbackMessage = "Request failed", mapData } = options;

  try {
    const response = await factory();
    const data = mapData
      ? mapData(response.data, response)
      : (response.data as unknown as TData);
    return { success: true, data };
  } catch (error) {
    const failure = {
      success: false as const,
      error: resolveErrorMessage(error, fallbackMessage),
    };

    if (axios.isAxiosError(error)) {
      return {
        ...failure,
        status: error.response?.status,
        details: error.response?.data,
      };
    }

    return failure;
  }
}

export function compactObject<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ) as Partial<T>;
}

export function serializeDateParams(params: QueryParams = {}): Record<string, Exclude<QueryValue, Date>> {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      value instanceof Date ? value.toISOString() : value,
    ])
  );
}

interface CrudMessages {
  list?: string;
  get?: string;
  create?: string;
  update?: string;
  remove?: string;
}

interface CrudOptions<TItem, TList> {
  client?: AxiosInstance;
  resourceName?: string;
  resourceNamePlural?: string;
  messages?: CrudMessages;
  mapList?: (data: unknown, response: AxiosResponse<unknown>) => TList;
  mapItem?: (data: unknown, response: AxiosResponse<unknown>) => TItem;
}

export function createCrudService<
  TItem,
  TCreate = Partial<TItem>,
  TUpdate = Partial<TCreate>,
  TList = TItem[],
>(basePath: string, options: CrudOptions<TItem, TList> = {}) {
  const {
    client = httpClient,
    resourceName = "resource",
    resourceNamePlural,
    messages = {},
    mapList,
    mapItem,
  } = options;

  const plural = resourceNamePlural ||
    (resourceName.endsWith("s") ? `${resourceName}es` : `${resourceName}s`);

  return {
    list(params?: AxiosRequestConfig["params"]): Promise<ApiResult<TList>> {
      return handleRequest<unknown, TList>(
        () => client.get(basePath, { params }),
        { fallbackMessage: messages.list || `Failed to fetch ${plural}`, mapData: mapList }
      );
    },
    get(id: string, params?: AxiosRequestConfig["params"]): Promise<ApiResult<TItem>> {
      return handleRequest<unknown, TItem>(
        () => client.get(`${basePath}/${id}`, { params }),
        { fallbackMessage: messages.get || `Failed to fetch ${resourceName}`, mapData: mapItem }
      );
    },
    create(payload: TCreate, config?: AxiosRequestConfig): Promise<ApiResult<TItem>> {
      return handleRequest<unknown, TItem>(
        () => client.post(basePath, payload, config),
        { fallbackMessage: messages.create || `Failed to create ${resourceName}`, mapData: mapItem }
      );
    },
    update(id: string, payload: TUpdate, config?: AxiosRequestConfig): Promise<ApiResult<TItem>> {
      return handleRequest<unknown, TItem>(
        () => client.put(`${basePath}/${id}`, payload, config),
        { fallbackMessage: messages.update || `Failed to update ${resourceName}`, mapData: mapItem }
      );
    },
    remove(id: string, config?: AxiosRequestConfig): Promise<ApiResult<void>> {
      return handleRequest(() => client.delete(`${basePath}/${id}`, config), {
        fallbackMessage: messages.remove || `Failed to delete ${resourceName}`,
      });
    },
  };
}
