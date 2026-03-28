using RadiatorStockAPI.Models;

namespace RadiatorStockAPI.Services.Warehouses;

public class WarehouseService : IWarehouseService
{
    private readonly IWarehouseDal _dal;

    public WarehouseService(IWarehouseDal dal)
    {
        _dal = dal;
    }

    public async Task<List<Warehouse>> GetAllAsync()
    {
        return await _dal.GetAllAsync();
    }

    public async Task<Warehouse?> GetByIdAsync(Guid id)
    {
        return await _dal.GetByIdAsync(id);
    }

    public async Task<Warehouse?> GetByCodeAsync(string code)
    {
        return await _dal.GetByCodeAsync(code);
    }

    public async Task<bool> ExistsByCodeAsync(string code)
    {
        return await _dal.ExistsByCodeAsync(code);
    }

    public async Task<bool> HasStockLevelsAsync(Guid warehouseId)
    {
        return await _dal.HasStockLevelsAsync(warehouseId);
    }

    public async Task<Warehouse> CreateAsync(string code, string name, string? location, string? address, string? phone, string? email)
    {
        var warehouse = new Warehouse
        {
            Id = Guid.NewGuid(),
            Code = code.ToUpper(),
            Name = name,
            Location = location,
            Address = address,
            Phone = phone,
            Email = email,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _dal.AddAsync(warehouse);
        await _dal.SaveChangesAsync();

        return warehouse;
    }

    public async Task<Warehouse> UpdateAsync(Guid id, string code, string name, string? location, string? address, string? phone, string? email)
    {
        var warehouse = await _dal.GetByIdAsync(id)
            ?? throw new ArgumentException($"Warehouse with ID {id} not found");

        warehouse.Code = code.ToUpper();
        warehouse.Name = name;
        warehouse.Location = location;
        warehouse.Address = address;
        warehouse.Phone = phone;
        warehouse.Email = email;
        warehouse.UpdatedAt = DateTime.UtcNow;

        await _dal.SaveChangesAsync();

        return warehouse;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        return await _dal.RemoveAsync(id);
    }
}
