export interface Warehouse {
  id: string;
  code: string;
  name: string;
  location?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type WarehousePayload = Omit<Warehouse, "id" | "createdAt" | "updatedAt">;
