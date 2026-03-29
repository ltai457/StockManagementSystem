using RadiatorStockAPI.DTOs.Stock;
using RadiatorStockAPI.Models;

namespace RadiatorStockAPI.Services.Stock;

public static class StockMapper
{
    public static RadiatorWithStockDto ToRadiatorWithStock(Radiator r)
    {
        var stockDict = r.StockLevels.ToDictionary(sl => sl.Warehouse.Code, sl => sl.Quantity);
        return new RadiatorWithStockDto
        {
            Id = r.Id, Name = r.Name, Code = r.Code, Brand = r.Brand, Year = r.Year,
            RetailPrice = r.RetailPrice, TradePrice = r.TradePrice, CostPrice = r.CostPrice,
            IsPriceOverridable = r.IsPriceOverridable, MaxDiscountPercent = r.MaxDiscountPercent,
            Stock = stockDict, TotalStock = stockDict.Values.Sum(),
            HasLowStock = stockDict.Values.Any(q => q > 0 && q <= StockAlertSettings.LowStockThreshold),
            HasOutOfStock = stockDict.Values.Any(q => q == 0),
            CreatedAt = r.CreatedAt, UpdatedAt = r.UpdatedAt
        };
    }

    public static StockMovementDto ToMovement(StockHistory sh) => new()
    {
        Id = sh.Id, Date = sh.CreatedAt, RadiatorId = sh.RadiatorId,
        ProductName = sh.Radiator.Name, ProductCode = sh.Radiator.Code, Brand = sh.Radiator.Brand,
        WarehouseId = sh.WarehouseId, WarehouseCode = sh.Warehouse.Code, WarehouseName = sh.Warehouse.Name,
        MovementType = sh.MovementType, Quantity = Math.Abs(sh.QuantityChange),
        OldQuantity = sh.OldQuantity, NewQuantity = sh.NewQuantity,
        ChangeType = sh.ChangeType, Notes = sh.Notes
    };

    public static LowStockItemDto ToLowStockItem(StockLevel sl, int threshold) => new()
    {
        RadiatorId = sl.RadiatorId, RadiatorName = sl.Radiator.Name,
        RadiatorCode = sl.Radiator.Code, Brand = sl.Radiator.Brand,
        WarehouseCode = sl.Warehouse.Code, WarehouseName = sl.Warehouse.Name,
        CurrentStock = sl.Quantity, Threshold = threshold, LastUpdated = sl.UpdatedAt
    };

    public static OutOfStockItemDto ToOutOfStockItem(StockLevel sl) => new()
    {
        RadiatorId = sl.RadiatorId, RadiatorName = sl.Radiator.Name,
        RadiatorCode = sl.Radiator.Code, Brand = sl.Radiator.Brand,
        WarehouseCode = sl.Warehouse.Code, WarehouseName = sl.Warehouse.Name,
        LastStockDate = sl.UpdatedAt
    };

    public static WarehouseStockDto ToWarehouseStock((Warehouse Warehouse, List<StockLevel> StockLevels) data)
    {
        var items = data.StockLevels.Select(sl =>
        {
            string status;
            if (sl.Quantity == 0)
            {
                status = "Out";
            }
            else if (sl.Quantity <= StockAlertSettings.LowStockThreshold)
            {
                status = "Low";
            }
            else
            {
                status = "Good";
            }

            return new WarehouseStockItemDto
            {
                RadiatorId = sl.RadiatorId, RadiatorName = sl.Radiator.Name,
                RadiatorCode = sl.Radiator.Code, Brand = sl.Radiator.Brand,
                Quantity = sl.Quantity,
                Status = status,
                LastUpdated = sl.UpdatedAt
            };
        }).ToList();

        return new WarehouseStockDto
        {
            WarehouseCode = data.Warehouse.Code, WarehouseName = data.Warehouse.Name,
            TotalItems = items.Count, TotalStock = items.Sum(i => i.Quantity),
            LowStockItems = items.Count(i => i.Status == "Low"),
            OutOfStockItems = items.Count(i => i.Status == "Out"),
            Items = items
        };
    }
}
