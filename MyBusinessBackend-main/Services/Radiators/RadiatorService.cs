using RadiatorStockAPI.DTOs.Radiators;
using RadiatorStockAPI.Models;
using RadiatorStockAPI.Services.Warehouses;

namespace RadiatorStockAPI.Services.Radiators;

public class RadiatorService : IRadiatorService
{
    private readonly IRadiatorDal _dal;
    private readonly IWarehouseService _warehouseService;

    public RadiatorService(IRadiatorDal dal, IWarehouseService warehouseService)
    {
        _dal = dal;
        _warehouseService = warehouseService;
    }

    public async Task<Radiator?> CreateAsync(CreateRadiatorDto dto)
    {
        if (await _dal.CodeExistsAsync(dto.Code)) return null;

        var now = DateTime.UtcNow;
        var radiator = new Radiator
        {
            Id = Guid.NewGuid(), Brand = dto.Brand, Code = dto.Code,
            Model = dto.Model, Type = dto.Type,
            RetailPrice = dto.RetailPrice, TradePrice = dto.TradePrice,
            CostPrice = dto.CostPrice, IsPriceOverridable = dto.IsPriceOverridable,
            MaxDiscountPercent = dto.MaxDiscountPercent,
            CoreDimension = dto.CoreDimension, Dimension = dto.Dimension,
            ImageUrl = dto.ImageUrl, Notes = dto.Notes,
            CreatedAt = now, UpdatedAt = now
        };

        await _dal.AddAsync(radiator);

        var warehouses = await _warehouseService.GetAllAsync();
        foreach (var wh in warehouses)
        {
            var qty = 0;
            if (dto.InitialStock != null && dto.InitialStock.TryGetValue(wh.Code, out var stockQty))
                qty = stockQty;
            await _dal.AddStockLevelAsync(new StockLevel
            {
                Id = Guid.NewGuid(), RadiatorId = radiator.Id, WarehouseId = wh.Id,
                Quantity = qty, CreatedAt = now, UpdatedAt = now
            });
        }

        await _dal.SaveChangesAsync();
        return await _dal.GetByIdWithStockAsync(radiator.Id);
    }

    public async Task<List<Radiator>> GetAllAsync() => await _dal.GetAllWithStockAsync();

    public async Task<(List<Radiator> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize)
        => await _dal.GetPagedWithStockAsync(pageNumber, pageSize);

    public async Task<Radiator?> GetByIdAsync(Guid id) => await _dal.GetByIdWithStockAsync(id);

    public async Task<Radiator?> UpdateAsync(Guid id, UpdateRadiatorDto dto)
    {
        var entity = await _dal.GetByIdAsync(id);
        if (entity is null) return null;

        if (!string.IsNullOrWhiteSpace(dto.Code) &&
            !dto.Code.Equals(entity.Code, StringComparison.OrdinalIgnoreCase) &&
            await _dal.CodeExistsAsync(dto.Code, excludeId: id))
            return null;

        entity.Brand = dto.Brand ?? entity.Brand;
        entity.Code = dto.Code ?? entity.Code;
        entity.Model = dto.Model ?? entity.Model;
        entity.Type = dto.Type ?? entity.Type;
        if (dto.RetailPrice.HasValue) entity.RetailPrice = dto.RetailPrice.Value;
        if (dto.TradePrice.HasValue) entity.TradePrice = dto.TradePrice.Value;
        if (dto.CostPrice.HasValue) entity.CostPrice = dto.CostPrice.Value;
        if (dto.IsPriceOverridable.HasValue) entity.IsPriceOverridable = dto.IsPriceOverridable.Value;
        if (dto.MaxDiscountPercent.HasValue) entity.MaxDiscountPercent = dto.MaxDiscountPercent.Value;
        entity.CoreDimension = dto.CoreDimension ?? entity.CoreDimension;
        entity.Dimension = dto.Dimension ?? entity.Dimension;
        entity.ImageUrl = dto.ImageUrl ?? entity.ImageUrl;
        entity.Notes = dto.Notes ?? entity.Notes;
        entity.UpdatedAt = DateTime.UtcNow;

        await _dal.SaveChangesAsync();
        return entity;
    }

    public async Task<bool> DeleteAsync(Guid id) => await _dal.RemoveAsync(id);
    public async Task<bool> ExistsAsync(Guid id) => await _dal.ExistsAsync(id);

    public async Task<List<Radiator>> UpdateMultiplePricesAsync(List<UpdateRadiatorPriceDto> updates)
    {
        if (updates == null || updates.Count == 0) return new List<Radiator>();

        var ids = updates.Select(u => u.Id).Distinct().ToList();
        var now = DateTime.UtcNow;
        var entities = await _dal.GetByIdsWithStockAsync(ids);

        foreach (var r in entities)
        {
            var change = updates.FirstOrDefault(u => u.Id == r.Id);
            if (change == null) continue;
            if (change.RetailPrice.HasValue) r.RetailPrice = change.RetailPrice.Value;
            if (change.TradePrice.HasValue) r.TradePrice = change.TradePrice.Value;
            if (change.CostPrice.HasValue) r.CostPrice = change.CostPrice.Value;
            r.UpdatedAt = now;
        }

        await _dal.SaveChangesAsync();
        return entities.OrderBy(r => r.Brand).ThenBy(r => r.Model).ToList();
    }
}
