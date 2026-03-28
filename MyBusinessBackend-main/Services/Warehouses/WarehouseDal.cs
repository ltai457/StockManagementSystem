using Microsoft.EntityFrameworkCore;
using RadiatorStockAPI.Data;
using RadiatorStockAPI.Models;

namespace RadiatorStockAPI.Services.Warehouses;

public class WarehouseDal : IWarehouseDal
{
    private readonly RadiatorDbContext _context;

    public WarehouseDal(RadiatorDbContext context)
    {
        _context = context;
    }

    public async Task<List<Warehouse>> GetAllAsync()
    {
        return await _context.Warehouses
            .OrderBy(w => w.Code)
            .ToListAsync();
    }

    public async Task<Warehouse?> GetByIdAsync(Guid id)
    {
        return await _context.Warehouses.FirstOrDefaultAsync(w => w.Id == id);
    }

    public async Task<Warehouse?> GetByCodeAsync(string code)
    {
        return await _context.Warehouses.FirstOrDefaultAsync(w => w.Code == code);
    }

    public async Task<bool> ExistsByCodeAsync(string code)
    {
        return await _context.Warehouses.AnyAsync(w => w.Code == code);
    }

    public async Task<bool> HasStockLevelsAsync(Guid warehouseId)
    {
        return await _context.StockLevels
            .AnyAsync(sl => sl.WarehouseId == warehouseId && sl.Quantity > 0);
    }

    public async Task AddAsync(Warehouse warehouse)
    {
        _context.Warehouses.Add(warehouse);
        await Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task<bool> RemoveAsync(Guid id)
    {
        var entity = await _context.Warehouses.FirstOrDefaultAsync(w => w.Id == id);
        if (entity is null) return false;

        _context.Warehouses.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }
}
