using RadiatorStockAPI.DTOs.Warehouses;
using RadiatorStockAPI.DTOs.Common;
using RadiatorStockAPI.Models;

namespace RadiatorStockAPI.Services.Warehouses;

public interface ICreateWarehouseHandler
{
    Task<Result<WarehouseDto>> CreateAsync(CreateWarehouseDto dto);
}

public class CreateWarehouseHandler : ICreateWarehouseHandler
{
    private readonly IWarehouseService _service;
    public CreateWarehouseHandler(IWarehouseService service) => _service = service;

    public async Task<Result<WarehouseDto>> CreateAsync(CreateWarehouseDto dto)
    {
        if (await _service.ExistsByCodeAsync(dto.Code)) return Result<WarehouseDto>.Conflict($"Code '{dto.Code}' already exists.");
        var w = await _service.CreateAsync(dto.Code, dto.Name, dto.Location, dto.Address, dto.Phone, dto.Email);
        return Result<WarehouseDto>.Created(ToDto(w), "GetById", new { id = w.Id });
    }

    private static WarehouseDto ToDto(Warehouse w) => new()
    {
        Id = w.Id, Code = w.Code, Name = w.Name, Location = w.Location,
        Address = w.Address, Phone = w.Phone, Email = w.Email,
        CreatedAt = w.CreatedAt, UpdatedAt = w.UpdatedAt
    };
}
