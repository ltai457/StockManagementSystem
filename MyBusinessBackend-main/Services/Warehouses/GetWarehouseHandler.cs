using RadiatorStockAPI.DTOs.Warehouses;
using RadiatorStockAPI.DTOs.Common;
using RadiatorStockAPI.Models;

namespace RadiatorStockAPI.Services.Warehouses;

public interface IGetWarehouseHandler
{
    Task<Result<List<WarehouseDto>>> GetAllAsync();
    Task<Result<WarehouseDto>> GetByIdAsync(Guid id);
}

public class GetWarehouseHandler : IGetWarehouseHandler
{
    private readonly IWarehouseService _service;
    public GetWarehouseHandler(IWarehouseService service) => _service = service;

    public async Task<Result<List<WarehouseDto>>> GetAllAsync()
        => Result<List<WarehouseDto>>.Ok((await _service.GetAllAsync()).Select(ToDto).ToList());

    public async Task<Result<WarehouseDto>> GetByIdAsync(Guid id)
    {
        var w = await _service.GetByIdAsync(id);
        if (w is null)
        {
            return Result<WarehouseDto>.NotFound($"Warehouse {id} not found.");
        }
        return Result<WarehouseDto>.Ok(ToDto(w));
    }

    private static WarehouseDto ToDto(Warehouse w) => new()
    {
        Id = w.Id, Code = w.Code, Name = w.Name, Location = w.Location,
        Address = w.Address, Phone = w.Phone, Email = w.Email,
        CreatedAt = w.CreatedAt, UpdatedAt = w.UpdatedAt
    };
}
