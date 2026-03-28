using RadiatorStockAPI.DTOs.Warehouses;
using RadiatorStockAPI.DTOs.Common;
using RadiatorStockAPI.Models;

namespace RadiatorStockAPI.Services.Warehouses;

public interface IUpdateWarehouseHandler
{
    Task<Result<WarehouseDto>> UpdateAsync(Guid id, UpdateWarehouseDto dto);
    Task<Result<object>> DeleteAsync(Guid id);
}

public class UpdateWarehouseHandler : IUpdateWarehouseHandler
{
    private readonly IWarehouseService _service;
    public UpdateWarehouseHandler(IWarehouseService service) => _service = service;

    public async Task<Result<WarehouseDto>> UpdateAsync(Guid id, UpdateWarehouseDto dto)
    {
        if (await _service.GetByIdAsync(id) is null) return Result<WarehouseDto>.NotFound($"Warehouse {id} not found.");
        var w = await _service.UpdateAsync(id, dto.Code, dto.Name, dto.Location, dto.Address, dto.Phone, dto.Email);
        return Result<WarehouseDto>.Ok(ToDto(w));
    }

    public async Task<Result<object>> DeleteAsync(Guid id)
    {
        if (await _service.GetByIdAsync(id) is null) return Result<object>.NotFound($"Warehouse {id} not found.");
        await _service.DeleteAsync(id);
        return Result<object>.Deleted();
    }

    private static WarehouseDto ToDto(Warehouse w) => new()
    {
        Id = w.Id, Code = w.Code, Name = w.Name, Location = w.Location,
        Address = w.Address, Phone = w.Phone, Email = w.Email,
        CreatedAt = w.CreatedAt, UpdatedAt = w.UpdatedAt
    };
}
