using System;
using RadiatorStockAPI.DTOs.Stock;

namespace RadiatorStockAPI.Services.Stock;

public interface IStockService
{
    Task<StockResponseDto?> GetRadiatorStockAsync(Guid radiatorId);
    Task<bool> UpdateStockAsync(Guid radiatorId, UpdateStockDto dto);
    Task<Dictionary<string, int>> GetStockDictionaryAsync(Guid radiatorId);

    Task<StockSummaryDto> GetStockSummaryAsync();
    Task<IEnumerable<RadiatorWithStockDto>> GetAllRadiatorsWithStockAsync(string? search = null, bool lowStockOnly = false, string? warehouseCode = null);
    Task<IEnumerable<LowStockItemDto>> GetLowStockItemsAsync(int threshold = 5);
    Task<IEnumerable<OutOfStockItemDto>> GetOutOfStockItemsAsync();
    Task<BulkUpdateResultDto> BulkUpdateStockAsync(BulkUpdateStockDto dto);
    Task<WarehouseStockDto?> GetWarehouseStockAsync(string warehouseCode);
    Task<IEnumerable<StockHistoryDto>> GetStockHistoryAsync(Guid radiatorId, DateTime? fromDate = null, DateTime? toDate = null, string? warehouseCode = null);
    Task<StockAdjustmentResultDto> AdjustStockAsync(StockAdjustmentDto dto);

    Task<IEnumerable<StockMovementDto>> GetStockMovementsAsync(
        Guid? radiatorId = null,
        string? warehouseCode = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? movementType = null,
        int? limit = null);
}
