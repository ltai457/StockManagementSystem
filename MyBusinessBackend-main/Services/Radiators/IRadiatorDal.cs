using RadiatorStockAPI.Models;

namespace RadiatorStockAPI.Services.Radiators;

public interface IRadiatorDal
{
    Task<List<Radiator>> GetAllWithStockAsync();
    Task<(List<Radiator> Items, int TotalCount)> GetPagedWithStockAsync(int pageNumber, int pageSize);
    Task<Radiator?> GetByIdWithStockAsync(Guid id);
    Task<Radiator?> GetByIdAsync(Guid id);
    Task AddAsync(Radiator radiator);
    Task AddStockLevelAsync(StockLevel stockLevel);
    Task SaveChangesAsync();
    Task<bool> RemoveAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
    Task<bool> CodeExistsAsync(string code, Guid? excludeId = null);
    Task<List<Radiator>> GetByIdsWithStockAsync(List<Guid> ids);
}
