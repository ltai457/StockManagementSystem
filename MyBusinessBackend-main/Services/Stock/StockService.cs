using RadiatorStockAPI.DTOs.Stock;
using RadiatorStockAPI.Models;
using RadiatorStockAPI.Services.Warehouses;

namespace RadiatorStockAPI.Services.Stock;

public class StockService : IStockService
{
    private readonly IStockDal _dal;
    private readonly IWarehouseService _warehouseService;
    private readonly ILogger<StockService> _logger;

    public StockService(IStockDal dal, IWarehouseService warehouseService, ILogger<StockService> logger)
    {
        _dal = dal;
        _warehouseService = warehouseService;
        _logger = logger;
    }

    public async Task<Dictionary<string, int>?> GetRadiatorStockAsync(Guid radiatorId)
    {
        if (!await _dal.RadiatorExistsAsync(radiatorId)) return null;
        var stockLevels = await _dal.GetStockLevelsForRadiatorAsync(radiatorId);
        return stockLevels.ToDictionary(sl => sl.Warehouse.Code, sl => sl.Quantity);
    }

    public async Task<bool> UpdateStockAsync(Guid radiatorId, string warehouseCode, int quantity)
    {
        if (!await _dal.RadiatorExistsAsync(radiatorId)) return false;
        var warehouse = await _warehouseService.GetByCodeAsync(warehouseCode);
        if (warehouse == null) return false;

        var stockLevel = await _dal.GetStockLevelAsync(radiatorId, warehouse.Id);
        var oldQuantity = stockLevel?.Quantity ?? 0;

        if (stockLevel == null)
        {
            await _dal.AddStockLevelAsync(new StockLevel
            {
                Id = Guid.NewGuid(), RadiatorId = radiatorId, WarehouseId = warehouse.Id,
                Quantity = quantity, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
            });
        }
        else
        {
            stockLevel.Quantity = quantity;
            stockLevel.UpdatedAt = DateTime.UtcNow;
        }

        await LogStockHistoryAsync(radiatorId, warehouse, oldQuantity, quantity, "Manual Update", null);
        await _dal.SaveChangesAsync();
        return true;
    }

    public async Task<(int TotalRadiators, int TotalStock, int LowStock, int OutOfStock, List<Warehouse> Warehouses, List<StockLevel> StockLevels)> GetStockSummaryDataAsync()
    {
        var totalRadiators = await _dal.GetRadiatorCountAsync();
        var stockLevels = await _dal.GetAllStockLevelsWithRelatedAsync();
        var totalStock = stockLevels.Sum(sl => sl.Quantity);
        var lowStock = stockLevels.Count(sl => sl.Quantity > 0 && sl.Quantity <= 5);
        var outOfStock = stockLevels.Count(sl => sl.Quantity == 0);
        var warehouses = stockLevels.Where(sl => sl.Warehouse != null).Select(sl => sl.Warehouse).DistinctBy(w => w.Id).ToList();
        return (totalRadiators, totalStock, lowStock, outOfStock, warehouses, stockLevels);
    }

    public async Task<List<Radiator>> GetRadiatorsWithStockAsync(string? search, bool lowStockOnly, string? warehouseCode)
        => await _dal.GetRadiatorsWithStockAsync(search, lowStockOnly, warehouseCode);

    public async Task<(List<Radiator> Items, int TotalCount)> GetRadiatorsWithStockPagedAsync(
        int pageNumber, int pageSize, string? search, bool lowStockOnly, string? warehouseCode)
        => await _dal.GetRadiatorsWithStockPagedAsync(pageNumber, pageSize, search, lowStockOnly, warehouseCode);

    public async Task<List<StockLevel>> GetLowStockItemsAsync(int threshold) => await _dal.GetLowStockLevelsAsync(threshold);

    public async Task<List<StockLevel>> GetOutOfStockItemsAsync() => await _dal.GetOutOfStockLevelsAsync();

    public async Task<(bool Success, string? Error, int SuccessCount, int ErrorCount, List<(Guid RadiatorId, string WarehouseCode, string Error)> Errors)> BulkUpdateStockAsync(List<StockUpdateItemDto> updates)
    {
        var successCount = 0;
        var errorCount = 0;
        var errors = new List<(Guid RadiatorId, string WarehouseCode, string Error)>();

        foreach (var update in updates)
        {
            try
            {
                if (await UpdateStockAsync(update.RadiatorId, update.WarehouseCode, update.Quantity))
                    successCount++;
                else
                {
                    errorCount++;
                    errors.Add((update.RadiatorId, update.WarehouseCode, "Failed to update stock"));
                }
            }
            catch (Exception ex)
            {
                errorCount++;
                errors.Add((update.RadiatorId, update.WarehouseCode, ex.Message));
            }
        }

        return (errorCount == 0, errorCount > 0 ? "Some updates failed" : null, successCount, errorCount, errors);
    }

    public async Task<(Warehouse Warehouse, List<StockLevel> StockLevels)?> GetWarehouseStockDataAsync(string warehouseCode)
    {
        var warehouse = await _warehouseService.GetByCodeAsync(warehouseCode);
        if (warehouse == null) return null;
        var stockLevels = await _dal.GetStockLevelsByWarehouseAsync(warehouse.Id);
        return (warehouse, stockLevels);
    }

    public async Task<(bool Success, string? Error, Guid RadiatorId, string WarehouseCode, int OldQuantity, int NewQuantity, string? Reason)> AdjustStockAsync(
        Guid radiatorId, string warehouseCode, int newQuantity, string? reason)
    {
        try
        {
            var currentStock = await GetRadiatorStockAsync(radiatorId);
            var oldQuantity = currentStock?.GetValueOrDefault(warehouseCode.ToUpper(), 0) ?? 0;
            var success = await UpdateStockAsync(radiatorId, warehouseCode, newQuantity);
            return (success, success ? null : "Failed to adjust stock", radiatorId, warehouseCode, oldQuantity, newQuantity, reason);
        }
        catch (Exception ex)
        {
            return (false, ex.Message, radiatorId, warehouseCode, 0, newQuantity, reason);
        }
    }

    public async Task<List<StockHistory>> GetStockMovementsAsync(
        Guid? radiatorId, string? warehouseCode, DateTime? fromDate, DateTime? toDate, string? movementType, int? limit)
    {
        Guid? warehouseId = null;
        if (!string.IsNullOrEmpty(warehouseCode))
        {
            var warehouse = await _warehouseService.GetByCodeAsync(warehouseCode);
            warehouseId = warehouse?.Id;
        }
        return await _dal.GetStockMovementsAsync(radiatorId, warehouseId, fromDate, toDate, movementType, limit);
    }

    public async Task<(List<StockHistory> Items, int TotalCount)> GetStockMovementsPagedAsync(
        int pageNumber, int pageSize, Guid? radiatorId, string? warehouseCode,
        DateTime? fromDate, DateTime? toDate, string? movementType)
    {
        Guid? warehouseId = null;
        if (!string.IsNullOrEmpty(warehouseCode))
        {
            var warehouse = await _warehouseService.GetByCodeAsync(warehouseCode);
            warehouseId = warehouse?.Id;
        }
        return await _dal.GetStockMovementsPagedAsync(pageNumber, pageSize, radiatorId, warehouseId, fromDate, toDate, movementType);
    }

    private async Task LogStockHistoryAsync(Guid radiatorId, Warehouse warehouse, int oldQuantity, int newQuantity, string changeType, Guid? updatedBy)
    {
        try
        {
            var quantityChange = newQuantity - oldQuantity;
            await _dal.AddStockHistoryAsync(new StockHistory
            {
                Id = Guid.NewGuid(), RadiatorId = radiatorId, WarehouseId = warehouse.Id,
                OldQuantity = oldQuantity, NewQuantity = newQuantity, QuantityChange = quantityChange,
                MovementType = quantityChange >= 0 ? "INCOMING" : "OUTGOING",
                ChangeType = changeType, UpdatedBy = updatedBy, CreatedAt = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging stock history for radiator {RadiatorId}", radiatorId);
        }
    }
}
