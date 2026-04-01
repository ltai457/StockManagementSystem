using RadiatorStockAPI.DTOs.Radiators;
using RadiatorStockAPI.Models;

namespace RadiatorStockAPI.Services.Radiators;

public interface IRadiatorService
{
    Task<Radiator?> CreateAsync(CreateRadiatorDto dto);
    Task<List<Radiator>> GetAllAsync();
    Task<(List<Radiator> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize);
    Task<Radiator?> GetByIdAsync(Guid id);
    Task<Radiator?> UpdateAsync(Guid id, UpdateRadiatorDto dto);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
}
