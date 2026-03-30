using RadiatorStockAPI.DTOs.Radiators;
using RadiatorStockAPI.Models;

namespace RadiatorStockAPI.Services.Radiators;

public static class RadiatorMapper
{
    public static Dictionary<string, int> BuildStockDict(IEnumerable<StockLevel> sl)
        => sl.Where(s => s.Warehouse != null && !string.IsNullOrWhiteSpace(s.Warehouse.Code))
             .GroupBy(s => s.Warehouse.Code!)
             .ToDictionary(g => g.Key, g => g.Sum(x => x.Quantity));

    public static RadiatorListDto ToListDto(Radiator r) => new()
    {
        Id = r.Id, Brand = r.Brand, Code = r.Code, Model = r.Model, Type = r.Type,
        RetailPrice = r.RetailPrice, TradePrice = r.TradePrice,
        IsPriceOverridable = r.IsPriceOverridable, MaxDiscountPercent = r.MaxDiscountPercent,
        Stock = BuildStockDict(r.StockLevels),
        CoreDimension = r.CoreDimension, Dimension = r.Dimension,
        ImageUrl = r.ImageUrl, Notes = r.Notes
    };

    public static RadiatorResponseDto ToResponseDto(Radiator r) => new()
    {
        Id = r.Id, Brand = r.Brand, Code = r.Code, Model = r.Model, Type = r.Type,
        RetailPrice = r.RetailPrice, TradePrice = r.TradePrice, CostPrice = r.CostPrice,
        IsPriceOverridable = r.IsPriceOverridable, MaxDiscountPercent = r.MaxDiscountPercent,
        Stock = BuildStockDict(r.StockLevels),
        CoreDimension = r.CoreDimension, Dimension = r.Dimension,
        ImageUrl = r.ImageUrl, Notes = r.Notes,
        CreatedAt = r.CreatedAt, UpdatedAt = r.UpdatedAt
    };
}
