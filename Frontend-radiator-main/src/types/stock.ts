export interface StockMutationPayload {
  radiatorId: string;
  warehouseCode: string;
  quantity: number | string;
  reason?: string;
}

export interface StockTransferPayload {
  radiatorId: string;
  fromWarehouseCode: string;
  toWarehouseCode: string;
  quantity: number | string;
  reason?: string;
}

export interface StockMovement {
  id: string;
  date: string;
  radiatorId: string;
  productName: string;
  productCode: string;
  brand: string;
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  movementType: string;
  quantity: number;
  oldQuantity: number;
  newQuantity: number;
  changeType: string;
  notes?: string | null;
}

export interface WarehouseStockSummary {
  code: string;
  name: string;
  totalStock: number;
  uniqueItems: number;
  lowStockItems: number;
  outOfStockItems: number;
}

export interface StockSummary {
  totalRadiators: number;
  totalStockItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  warehouseSummaries: WarehouseStockSummary[];
  generatedAt: string;
}
