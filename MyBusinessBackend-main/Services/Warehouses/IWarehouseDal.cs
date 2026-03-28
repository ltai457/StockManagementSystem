using RadiatorStockAPI.Models;

namespace RadiatorStockAPI.Services.Warehouses;

public interface IWarehouseDal
{
    Task<List<Warehouse>> GetAllAsync();
    Task<Warehouse?> GetByIdAsync(Guid id);
    Task<Warehouse?> GetByCodeAsync(string code);
    Task<bool> ExistsByCodeAsync(string code);
    Task<bool> HasStockLevelsAsync(Guid warehouseId);
    Task AddAsync(Warehouse warehouse);
    Task SaveChangesAsync();
    Task<bool> RemoveAsync(Guid id);
}
