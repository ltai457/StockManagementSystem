export interface Radiator {
  id: string;
  brand: string;
  code: string;
  model: string;
  type?: string | null;
  coreDimension?: string | null;
  dimension?: string | null;
  imageUrl?: string | null;
  notes?: string | null;
  stock?: Record<string, number>;
  totalStock?: number;
  hasLowStock?: boolean;
  hasOutOfStock?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRadiatorPayload {
  brand: string;
  code: string;
  model: string;
  type?: string | null;
  coreDimension?: string | null;
  dimension?: string | null;
  imageUrl?: string | null;
  notes?: string | null;
  initialStock?: Record<string, number>;
}

export interface RadiatorFormValues {
  brand: string;
  code: string;
  model: string;
  type: string;
  coreDimension: string;
  dimension: string;
  imageUrl: string;
  notes: string;
}
