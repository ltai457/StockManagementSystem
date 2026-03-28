using RadiatorStockAPI.Models;

namespace RadiatorStockAPI.Services.Stock;

public interface IStockDal
{
    // Stock levels
    Task<StockLevel?> GetStockLevelAsync(Guid radiatorId, Guid warehouseId);
    Task<List<StockLevel>> GetStockLevelsForRadiatorAsync(Guid radiatorId);
    Task<List<StockLevel>> GetAllStockLevelsWithRelatedAsync();
    Task<List<StockLevel>> GetStockLevelsByWarehouseAsync(Guid warehouseId);
    Task<List<StockLevel>> GetLowStockLevelsAsync(int threshold);
    Task<List<StockLevel>> GetOutOfStockLevelsAsync();
    Task AddStockLevelAsync(StockLevel stockLevel);

    // Radiators with stock (optimized queries)
    Task<List<Radiator>> GetRadiatorsWithStockAsync(string? search, bool lowStockOnly, string? warehouseCode);
    Task<(List<Radiator> Items, int TotalCount)> GetRadiatorsWithStockPagedAsync(
        int pageNumber, int pageSize, string? search, bool lowStockOnly, string? warehouseCode);

    // Stock history
    Task AddStockHistoryAsync(StockHistory history);
    Task<List<StockHistory>> GetStockMovementsAsync(
        Guid? radiatorId, Guid? warehouseId, DateTime? fromDate, DateTime? toDate, string? movementType, int? limit);
    Task<(List<StockHistory> Items, int TotalCount)> GetStockMovementsPagedAsync(
        int pageNumber, int pageSize, Guid? radiatorId, Guid? warehouseId,
        DateTime? fromDate, DateTime? toDate, string? movementType);

    // Counts
    Task<int> GetRadiatorCountAsync();
    Task<bool> RadiatorExistsAsync(Guid radiatorId);

    Task SaveChangesAsync();
}
