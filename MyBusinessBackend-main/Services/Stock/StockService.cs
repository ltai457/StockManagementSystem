using RadiatorStockAPI.DTOs.Stock;
using RadiatorStockAPI.Models;
using RadiatorStockAPI.Services.Warehouses;
using Microsoft.EntityFrameworkCore;

namespace RadiatorStockAPI.Services.Stock;

public class StockService : IStockService
{
    private readonly IStockDal _dal;
    private readonly IWarehouseService _warehouseService;

    public StockService(IStockDal dal, IWarehouseService warehouseService)
    {
        _dal = dal;
        _warehouseService = warehouseService;
    }

    public async Task<Dictionary<string, int>?> GetRadiatorStockAsync(Guid radiatorId)
    {
        if (!await _dal.RadiatorExistsAsync(radiatorId)) return null;
        var stockLevels = await _dal.GetStockLevelsForRadiatorAsync(radiatorId);
        return stockLevels.ToDictionary(sl => sl.Warehouse.Code, sl => sl.Quantity);
    }

    public async Task<bool> UpdateStockAsync(Guid radiatorId, string warehouseCode, int quantity, Guid? updatedBy = null, string? reason = null)
    {
        if (!await PrepareStockUpdateAsync(radiatorId, warehouseCode, quantity, updatedBy, reason))
            return false;

        await SaveStockChangesAsync();
        return true;
    }

    public async Task<(int TotalRadiators, int TotalStock, int LowStock, int OutOfStock, List<Warehouse> Warehouses, List<StockLevel> StockLevels)> GetStockSummaryDataAsync()
    {
        var totalRadiators = await _dal.GetRadiatorCountAsync();
        var stockLevels = await _dal.GetAllStockLevelsWithRelatedAsync();
        var totalStock = stockLevels.Sum(sl => sl.Quantity);
        var lowStock = stockLevels.Count(sl => sl.Quantity > 0 && sl.Quantity <= StockAlertSettings.LowStockThreshold);
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

    public async Task<(bool Success, string? Error, int SuccessCount, int ErrorCount, List<(Guid RadiatorId, string WarehouseCode, string Error)> Errors)> BulkUpdateStockAsync(List<StockUpdateItemDto> updates, Guid? updatedBy = null, string? reason = null)
    {
        var errors = new List<(Guid RadiatorId, string WarehouseCode, string Error)>();

        foreach (var update in updates)
        {
            if (!await PrepareStockUpdateAsync(update.RadiatorId, update.WarehouseCode, update.Quantity, updatedBy, reason))
            {
                errors.Add((update.RadiatorId, update.WarehouseCode, "Radiator or warehouse was not found."));
            }
        }

        if (errors.Count > 0)
            return (false, "No stock was changed because one or more updates were invalid.", 0, errors.Count, errors);

        await SaveStockChangesAsync();
        return (true, null, updates.Count, 0, errors);
    }

    public async Task<(Warehouse Warehouse, List<StockLevel> StockLevels)?> GetWarehouseStockDataAsync(string warehouseCode)
    {
        var warehouse = await _warehouseService.GetByCodeAsync(warehouseCode);
        if (warehouse == null) return null;
        var stockLevels = await _dal.GetStockLevelsByWarehouseAsync(warehouse.Id);
        return (warehouse, stockLevels);
    }

    public async Task<(bool Success, string? Error, Guid RadiatorId, string WarehouseCode, int OldQuantity, int NewQuantity, string? Reason)> AdjustStockAsync(
        Guid radiatorId, string warehouseCode, int newQuantity, string? reason, Guid? updatedBy = null)
    {
        try
        {
            var currentStock = await GetRadiatorStockAsync(radiatorId);
            var oldQuantity = currentStock?.GetValueOrDefault(warehouseCode.ToUpper(), 0) ?? 0;
            var success = await UpdateStockAsync(radiatorId, warehouseCode, newQuantity, updatedBy, reason);
            return (success, success ? null : "Failed to adjust stock", radiatorId, warehouseCode, oldQuantity, newQuantity, reason);
        }
        catch (StockConcurrencyException)
        {
            throw;
        }
        catch (Exception ex)
        {
            return (false, ex.Message, radiatorId, warehouseCode, 0, newQuantity, reason);
        }
    }

    public async Task<(bool Success, string? Error, Guid RadiatorId, string WarehouseCode, int QuantityAdded, int NewQuantity, string? Reason)> RecordStockInAsync(
        Guid radiatorId,
        string warehouseCode,
        int quantity,
        string? reason,
        Guid? updatedBy)
    {
        if (quantity <= 0)
        {
            return (false, "Stock in quantity must be greater than zero.", radiatorId, warehouseCode, quantity, 0, reason);
        }

        var warehouse = await _warehouseService.GetByCodeAsync(warehouseCode);
        if (warehouse == null)
        {
            return (false, $"Warehouse '{warehouseCode}' not found.", radiatorId, warehouseCode, quantity, 0, reason);
        }

        var stockLevel = await EnsureStockLevelAsync(radiatorId, warehouse.Id);
        var oldQuantity = stockLevel.Quantity;
        stockLevel.Quantity += quantity;
        stockLevel.UpdatedAt = DateTime.UtcNow;

        await LogStockHistoryAsync(
            radiatorId,
            warehouse,
            oldQuantity,
            stockLevel.Quantity,
            "Stock In",
            updatedBy,
            string.IsNullOrWhiteSpace(reason) ? "Stock received." : reason.Trim()
        );

        await SaveStockChangesAsync();
        return (true, null, radiatorId, warehouse.Code, quantity, stockLevel.Quantity, reason);
    }

    public async Task<(bool Success, string? Error, Guid RadiatorId, string FromWarehouseCode, string ToWarehouseCode, int Quantity)> TransferStockAsync(
        Guid radiatorId,
        string fromWarehouseCode,
        string toWarehouseCode,
        int quantity,
        string? reason,
        Guid? updatedBy)
    {
        if (quantity <= 0)
        {
            return (false, "Transfer quantity must be greater than zero.", radiatorId, fromWarehouseCode, toWarehouseCode, quantity);
        }

        if (string.Equals(fromWarehouseCode, toWarehouseCode, StringComparison.OrdinalIgnoreCase))
        {
            return (false, "Source and destination warehouses must be different.", radiatorId, fromWarehouseCode, toWarehouseCode, quantity);
        }

        var fromWarehouse = await _warehouseService.GetByCodeAsync(fromWarehouseCode);
        if (fromWarehouse == null)
        {
            return (false, $"Warehouse '{fromWarehouseCode}' not found.", radiatorId, fromWarehouseCode, toWarehouseCode, quantity);
        }

        var toWarehouse = await _warehouseService.GetByCodeAsync(toWarehouseCode);
        if (toWarehouse == null)
        {
            return (false, $"Warehouse '{toWarehouseCode}' not found.", radiatorId, fromWarehouseCode, toWarehouseCode, quantity);
        }

        var sourceLevel = await _dal.GetStockLevelAsync(radiatorId, fromWarehouse.Id);
        var sourceQuantity = sourceLevel?.Quantity ?? 0;

        if (sourceQuantity < quantity)
        {
            return (false, $"Not enough stock in {fromWarehouse.Code}. Available: {sourceQuantity}.", radiatorId, fromWarehouse.Code, toWarehouse.Code, quantity);
        }

        var destinationLevel = await EnsureStockLevelAsync(radiatorId, toWarehouse.Id);
        sourceLevel!.Quantity = sourceQuantity - quantity;
        sourceLevel.UpdatedAt = DateTime.UtcNow;

        var destinationOldQuantity = destinationLevel.Quantity;
        destinationLevel.Quantity += quantity;
        destinationLevel.UpdatedAt = DateTime.UtcNow;

        await LogStockHistoryAsync(
            radiatorId,
            fromWarehouse,
            sourceQuantity,
            sourceLevel.Quantity,
            "Stock Movement Out",
            updatedBy,
            BuildTransferNote("to", toWarehouse.Code, reason)
        );
        await LogStockHistoryAsync(
            radiatorId,
            toWarehouse,
            destinationOldQuantity,
            destinationLevel.Quantity,
            "Stock Movement In",
            updatedBy,
            BuildTransferNote("from", fromWarehouse.Code, reason)
        );

        await SaveStockChangesAsync();
        return (true, null, radiatorId, fromWarehouse.Code, toWarehouse.Code, quantity);
    }

    public async Task<(bool Success, string? Error, Guid RadiatorId, string WarehouseCode, int QuantitySold, int RemainingQuantity, string? Reason)> RecordSaleAsync(
        Guid radiatorId,
        string warehouseCode,
        int quantity,
        string? reason,
        Guid? updatedBy)
    {
        if (quantity <= 0)
        {
            return (false, "Sold quantity must be greater than zero.", radiatorId, warehouseCode, quantity, 0, reason);
        }

        var warehouse = await _warehouseService.GetByCodeAsync(warehouseCode);
        if (warehouse == null)
        {
            return (false, $"Warehouse '{warehouseCode}' not found.", radiatorId, warehouseCode, quantity, 0, reason);
        }

        var stockLevel = await _dal.GetStockLevelAsync(radiatorId, warehouse.Id);
        var currentQuantity = stockLevel?.Quantity ?? 0;

        if (currentQuantity < quantity)
        {
            return (false, $"Not enough stock in {warehouse.Code}. Available: {currentQuantity}.", radiatorId, warehouse.Code, quantity, currentQuantity, reason);
        }

        stockLevel!.Quantity = currentQuantity - quantity;
        stockLevel.UpdatedAt = DateTime.UtcNow;

        await LogStockHistoryAsync(
            radiatorId,
            warehouse,
            currentQuantity,
            stockLevel.Quantity,
            "Sale",
            updatedBy,
            string.IsNullOrWhiteSpace(reason) ? "Sale recorded manually." : reason.Trim()
        );

        await SaveStockChangesAsync();
        return (true, null, radiatorId, warehouse.Code, quantity, stockLevel.Quantity, reason);
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

    private async Task LogStockHistoryAsync(Guid radiatorId, Warehouse warehouse, int oldQuantity, int newQuantity, string changeType, Guid? updatedBy, string? notes = null)
    {
        var quantityChange = newQuantity - oldQuantity;
        await _dal.AddStockHistoryAsync(new StockHistory
        {
            Id = Guid.NewGuid(), RadiatorId = radiatorId, WarehouseId = warehouse.Id,
            OldQuantity = oldQuantity, NewQuantity = newQuantity, QuantityChange = quantityChange,
            MovementType = quantityChange >= 0 ? "INCOMING" : "OUTGOING",
            ChangeType = changeType, UpdatedBy = updatedBy, CreatedAt = DateTime.UtcNow,
            Notes = string.IsNullOrWhiteSpace(notes) ? null : notes.Trim()
        });
    }

    private async Task<bool> PrepareStockUpdateAsync(
        Guid radiatorId,
        string warehouseCode,
        int quantity,
        Guid? updatedBy,
        string? reason)
    {
        if (!await _dal.RadiatorExistsAsync(radiatorId))
            return false;

        var warehouse = await _warehouseService.GetByCodeAsync(warehouseCode);
        if (warehouse == null)
            return false;

        var stockLevel = await _dal.GetStockLevelAsync(radiatorId, warehouse.Id);
        var oldQuantity = stockLevel?.Quantity ?? 0;

        if (stockLevel == null)
        {
            await _dal.AddStockLevelAsync(new StockLevel
            {
                Id = Guid.NewGuid(),
                RadiatorId = radiatorId,
                WarehouseId = warehouse.Id,
                Quantity = quantity,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }
        else
        {
            stockLevel.Quantity = quantity;
            stockLevel.UpdatedAt = DateTime.UtcNow;
        }

        await LogStockHistoryAsync(
            radiatorId,
            warehouse,
            oldQuantity,
            quantity,
            "Manual Adjustment",
            updatedBy,
            reason);

        return true;
    }

    private async Task SaveStockChangesAsync()
    {
        try
        {
            // EF Core wraps all changes in this SaveChanges call in one transaction,
            // so the quantity and audit history either both commit or both fail.
            await _dal.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException ex)
        {
            throw new StockConcurrencyException(ex);
        }
    }

    private async Task<StockLevel> EnsureStockLevelAsync(Guid radiatorId, Guid warehouseId)
    {
        var stockLevel = await _dal.GetStockLevelAsync(radiatorId, warehouseId);
        if (stockLevel != null)
        {
            return stockLevel;
        }

        stockLevel = new StockLevel
        {
            Id = Guid.NewGuid(),
            RadiatorId = radiatorId,
            WarehouseId = warehouseId,
            Quantity = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _dal.AddStockLevelAsync(stockLevel);
        return stockLevel;
    }

    private static string BuildTransferNote(string direction, string warehouseCode, string? reason)
    {
        var reference = $"Stock moved {direction} {warehouseCode}.";
        return string.IsNullOrWhiteSpace(reason)
            ? reference
            : $"{reference} {reason.Trim()}";
    }
}
