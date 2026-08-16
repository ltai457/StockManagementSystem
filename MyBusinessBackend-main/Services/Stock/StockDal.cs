using Microsoft.EntityFrameworkCore;
using RadiatorStockAPI.Data;
using RadiatorStockAPI.Models;

namespace RadiatorStockAPI.Services.Stock;

public class StockDal : IStockDal
{
    private readonly RadiatorDbContext _context;
    public StockDal(RadiatorDbContext context) => _context = context;

    public async Task<StockLevel?> GetStockLevelAsync(Guid radiatorId, Guid warehouseId)
        => _context.StockLevels.Local.FirstOrDefault(sl => sl.RadiatorId == radiatorId && sl.WarehouseId == warehouseId)
            ?? await _context.StockLevels.FirstOrDefaultAsync(sl => sl.RadiatorId == radiatorId && sl.WarehouseId == warehouseId);

    public async Task<List<StockLevel>> GetStockLevelsForRadiatorAsync(Guid radiatorId)
        => await _context.StockLevels.Include(sl => sl.Warehouse).Where(sl => sl.RadiatorId == radiatorId).ToListAsync();

    public async Task<List<StockLevel>> GetAllStockLevelsWithRelatedAsync()
        => await _context.StockLevels.Include(sl => sl.Warehouse).Include(sl => sl.Radiator).ToListAsync();

    public async Task<List<StockLevel>> GetStockLevelsByWarehouseAsync(Guid warehouseId)
        => await _context.StockLevels.Where(sl => sl.WarehouseId == warehouseId).Include(sl => sl.Radiator).ToListAsync();

    public async Task<List<StockLevel>> GetLowStockLevelsAsync(int threshold)
        => await _context.StockLevels.Where(sl => sl.Quantity > 0 && sl.Quantity <= threshold)
            .Include(sl => sl.Radiator).Include(sl => sl.Warehouse).ToListAsync();

    public async Task<List<StockLevel>> GetOutOfStockLevelsAsync()
        => await _context.StockLevels.Where(sl => sl.Quantity == 0)
            .Include(sl => sl.Radiator).Include(sl => sl.Warehouse).ToListAsync();

    public async Task AddStockLevelAsync(StockLevel stockLevel)
    {
        _context.StockLevels.Add(stockLevel);
        await Task.CompletedTask;
    }

    public async Task<List<Radiator>> GetRadiatorsWithStockAsync(string? search, bool lowStockOnly, string? warehouseCode)
    {
        var query = _context.Radiators.Include(r => r.StockLevels).ThenInclude(sl => sl.Warehouse).AsQueryable();
        query = ApplyStockFilters(query, search, lowStockOnly, warehouseCode);
        return await query.ToListAsync();
    }

    public async Task<(List<Radiator> Items, int TotalCount)> GetRadiatorsWithStockPagedAsync(
        int pageNumber, int pageSize, string? search, bool lowStockOnly, string? warehouseCode)
    {
        var query = _context.Radiators.Include(r => r.StockLevels).ThenInclude(sl => sl.Warehouse).AsQueryable();
        query = ApplyStockFilters(query, search, lowStockOnly, warehouseCode);
        var totalCount = await query.CountAsync();
        var items = await query.OrderByDescending(r => r.UpdatedAt).ThenByDescending(r => r.CreatedAt)
            .Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
        return (items, totalCount);
    }

    public async Task AddStockHistoryAsync(StockHistory history)
    {
        _context.StockHistories.Add(history);
        await Task.CompletedTask;
    }

    public async Task<List<StockHistory>> GetStockMovementsAsync(
        Guid? radiatorId, Guid? warehouseId, DateTime? fromDate, DateTime? toDate, string? movementType, int? limit)
    {
        var query = BuildMovementQuery(radiatorId, warehouseId, fromDate, toDate, movementType);
        query = query.OrderByDescending(sh => sh.CreatedAt);
        if (limit.HasValue && limit.Value > 0) query = query.Take(limit.Value);
        return await query.ToListAsync();
    }

    public async Task<(List<StockHistory> Items, int TotalCount)> GetStockMovementsPagedAsync(
        int pageNumber, int pageSize, Guid? radiatorId, Guid? warehouseId,
        DateTime? fromDate, DateTime? toDate, string? movementType)
    {
        var query = BuildMovementQuery(radiatorId, warehouseId, fromDate, toDate, movementType);
        var totalCount = await query.CountAsync();
        var items = await query.OrderByDescending(sh => sh.CreatedAt)
            .Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
        return (items, totalCount);
    }

    public async Task<int> GetRadiatorCountAsync() => await _context.Radiators.CountAsync();
    public async Task<bool> RadiatorExistsAsync(Guid radiatorId) => await _context.Radiators.AnyAsync(r => r.Id == radiatorId);
    public async Task SaveChangesAsync() => await _context.SaveChangesAsync();

    private static IQueryable<Radiator> ApplyStockFilters(IQueryable<Radiator> query, string? search, bool lowStockOnly, string? warehouseCode)
    {
        if (!string.IsNullOrEmpty(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(r => r.Model.ToLower().Contains(searchLower) || r.Code.ToLower().Contains(searchLower) || r.Brand.ToLower().Contains(searchLower) || (r.Type != null && r.Type.ToLower().Contains(searchLower)));
        }
        if (!string.IsNullOrEmpty(warehouseCode))
        {
            var warehouseUpper = warehouseCode.ToUpper();
            query = query.Where(r => r.StockLevels.Any(sl => sl.Warehouse.Code == warehouseUpper));
        }
        if (lowStockOnly)
            query = query.Where(r => r.StockLevels.Any(sl => sl.Quantity >= 0 && sl.Quantity <= StockAlertSettings.LowStockThreshold));
        return query;
    }

    private IQueryable<StockHistory> BuildMovementQuery(
        Guid? radiatorId, Guid? warehouseId, DateTime? fromDate, DateTime? toDate, string? movementType)
    {
        var query = _context.StockHistories.Include(sh => sh.Radiator).Include(sh => sh.Warehouse).AsQueryable();
        if (radiatorId.HasValue) query = query.Where(sh => sh.RadiatorId == radiatorId.Value);
        if (warehouseId.HasValue) query = query.Where(sh => sh.WarehouseId == warehouseId.Value);
        if (fromDate.HasValue) query = query.Where(sh => sh.CreatedAt >= fromDate.Value);
        if (toDate.HasValue) query = query.Where(sh => sh.CreatedAt <= toDate.Value);
        if (!string.IsNullOrEmpty(movementType)) query = query.Where(sh => sh.MovementType == movementType.ToUpper());
        return query;
    }
}
