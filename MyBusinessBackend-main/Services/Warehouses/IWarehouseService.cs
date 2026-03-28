using RadiatorStockAPI.Models;

namespace RadiatorStockAPI.Services.Warehouses;

public interface IWarehouseService
{
    Task<List<Warehouse>> GetAllAsync();
    Task<Warehouse?> GetByIdAsync(Guid id);
    Task<Warehouse?> GetByCodeAsync(string code);
    Task<bool> ExistsByCodeAsync(string code);
    Task<bool> HasStockLevelsAsync(Guid warehouseId);
    Task<Warehouse> CreateAsync(string code, string name, string? location, string? address, string? phone, string? email);
    Task<Warehouse> UpdateAsync(Guid id, string code, string name, string? location, string? address, string? phone, string? email);
    Task<bool> DeleteAsync(Guid id);
}
