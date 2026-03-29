using RadiatorStockAPI.DTOs.Stock;
using RadiatorStockAPI.DTOs.Common;
using RadiatorStockAPI.Models;

namespace RadiatorStockAPI.Services.Stock;

public interface IStockService
{
    Task<Dictionary<string, int>?> GetRadiatorStockAsync(Guid radiatorId);
    Task<bool> UpdateStockAsync(Guid radiatorId, string warehouseCode, int quantity);
    Task<(int TotalRadiators, int TotalStock, int LowStock, int OutOfStock, List<Warehouse> Warehouses, List<StockLevel> StockLevels)> GetStockSummaryDataAsync();
    Task<List<Radiator>> GetRadiatorsWithStockAsync(string? search, bool lowStockOnly, string? warehouseCode);
    Task<(List<Radiator> Items, int TotalCount)> GetRadiatorsWithStockPagedAsync(int pageNumber, int pageSize, string? search, bool lowStockOnly, string? warehouseCode);
    Task<List<StockLevel>> GetLowStockItemsAsync(int threshold);
    Task<List<StockLevel>> GetOutOfStockItemsAsync();
    Task<(bool Success, string? Error, int SuccessCount, int ErrorCount, List<(Guid RadiatorId, string WarehouseCode, string Error)> Errors)> BulkUpdateStockAsync(List<StockUpdateItemDto> updates);
    Task<(Warehouse Warehouse, List<StockLevel> StockLevels)?> GetWarehouseStockDataAsync(string warehouseCode);
    Task<(bool Success, string? Error, Guid RadiatorId, string WarehouseCode, int OldQuantity, int NewQuantity, string? Reason)> AdjustStockAsync(Guid radiatorId, string warehouseCode, int newQuantity, string? reason);
    Task<(bool Success, string? Error, Guid RadiatorId, string WarehouseCode, int QuantityAdded, int NewQuantity, string? Reason)> RecordStockInAsync(Guid radiatorId, string warehouseCode, int quantity, string? reason, Guid? updatedBy);
    Task<(bool Success, string? Error, Guid RadiatorId, string FromWarehouseCode, string ToWarehouseCode, int Quantity)> TransferStockAsync(Guid radiatorId, string fromWarehouseCode, string toWarehouseCode, int quantity, string? reason, Guid? updatedBy);
    Task<(bool Success, string? Error, Guid RadiatorId, string WarehouseCode, int QuantitySold, int RemainingQuantity, string? Reason)> RecordSaleAsync(Guid radiatorId, string warehouseCode, int quantity, string? reason, Guid? updatedBy);
    Task<List<StockHistory>> GetStockMovementsAsync(Guid? radiatorId, string? warehouseCode, DateTime? fromDate, DateTime? toDate, string? movementType, int? limit);
    Task<(List<StockHistory> Items, int TotalCount)> GetStockMovementsPagedAsync(int pageNumber, int pageSize, Guid? radiatorId, string? warehouseCode, DateTime? fromDate, DateTime? toDate, string? movementType);
}
