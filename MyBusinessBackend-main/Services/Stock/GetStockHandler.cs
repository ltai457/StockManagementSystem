using RadiatorStockAPI.DTOs.Stock;
using RadiatorStockAPI.DTOs.Common;
using RadiatorStockAPI.Services.Radiators;

namespace RadiatorStockAPI.Services.Stock;

public interface IGetStockHandler
{
    Task<Result<StockResponseDto>> GetRadiatorStockAsync(Guid radiatorId);
    Task<Result<StockSummaryDto>> GetStockSummaryAsync();
    Task<Result<object>> GetAllRadiatorsWithStockAsync(string? search, bool lowStockOnly, string? warehouseCode, int? pageNumber, int? pageSize);
    Task<Result<List<LowStockItemDto>>> GetLowStockItemsAsync(int threshold);
    Task<Result<List<OutOfStockItemDto>>> GetOutOfStockItemsAsync();
    Task<Result<WarehouseStockDto>> GetWarehouseStockAsync(string warehouseCode);
    Task<Result<object>> GetStockMovementsAsync(Guid? radiatorId, string? warehouseCode, DateTime? fromDate, DateTime? toDate, string? movementType, int? limit, int? pageNumber, int? pageSize);
    Task<Result<List<StockHistoryDto>>> GetStockHistoryAsync(Guid radiatorId, DateTime? fromDate, DateTime? toDate, string? warehouseCode);
}

public class GetStockHandler : IGetStockHandler
{
    private readonly IStockService _service;
    private readonly IRadiatorService _radiatorService;

    public GetStockHandler(IStockService service, IRadiatorService radiatorService)
    {
        _service = service;
        _radiatorService = radiatorService;
    }

    public async Task<Result<StockResponseDto>> GetRadiatorStockAsync(Guid radiatorId)
    {
        if (!await _radiatorService.ExistsAsync(radiatorId))
        {
            return Result<StockResponseDto>.NotFound($"Radiator {radiatorId} not found.");
        }

        var stock = await _service.GetRadiatorStockAsync(radiatorId);
        if (stock is null)
        {
            return Result<StockResponseDto>.NotFound($"Stock not found for radiator {radiatorId}.");
        }
        return Result<StockResponseDto>.Ok(new StockResponseDto { Stock = stock });
    }

    public async Task<Result<StockSummaryDto>> GetStockSummaryAsync()
    {
        var (totalRadiators, totalStock, lowStock, outOfStock, warehouses, stockLevels) =
            await _service.GetStockSummaryDataAsync();

        var warehouseSummaries = warehouses.Select(w =>
        {
            var warehouseStock = stockLevels.Where(sl => sl.WarehouseId == w.Id);
            return new WarehouseSummaryDto
            {
                Code = w.Code, Name = w.Name,
                TotalStock = warehouseStock.Sum(sl => sl.Quantity),
                UniqueItems = warehouseStock.Count(),
                LowStockItems = warehouseStock.Count(sl => sl.Quantity > 0 && sl.Quantity <= StockAlertSettings.LowStockThreshold),
                OutOfStockItems = warehouseStock.Count(sl => sl.Quantity == 0)
            };
        }).ToList();

        return Result<StockSummaryDto>.Ok(new StockSummaryDto
        {
            TotalRadiators = totalRadiators, TotalStockItems = totalStock,
            LowStockItems = lowStock, OutOfStockItems = outOfStock,
            WarehouseSummaries = warehouseSummaries
        });
    }

    public async Task<Result<object>> GetAllRadiatorsWithStockAsync(
        string? search, bool lowStockOnly, string? warehouseCode, int? pageNumber, int? pageSize)
    {
        if (pageNumber.HasValue || pageSize.HasValue)
        {
            var p = new PaginationParams { PageNumber = pageNumber ?? 1, PageSize = pageSize ?? 20 };
            var (items, totalCount) = await _service.GetRadiatorsWithStockPagedAsync(
                p.PageNumber, p.PageSize, search, lowStockOnly, warehouseCode);

            return Result<object>.Ok(new PagedResult<RadiatorWithStockDto>
            {
                Items = items.Select(StockMapper.ToRadiatorWithStock).ToList(),
                PageNumber = p.PageNumber, PageSize = p.PageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)p.PageSize)
            });
        }

        var radiators = await _service.GetRadiatorsWithStockAsync(search, lowStockOnly, warehouseCode);
        return Result<object>.Ok(radiators.Select(StockMapper.ToRadiatorWithStock).ToList());
    }

    public async Task<Result<List<LowStockItemDto>>> GetLowStockItemsAsync(int threshold)
    {
        var items = await _service.GetLowStockItemsAsync(threshold);
        return Result<List<LowStockItemDto>>.Ok(items.Select(sl => StockMapper.ToLowStockItem(sl, threshold)).ToList());
    }

    public async Task<Result<List<OutOfStockItemDto>>> GetOutOfStockItemsAsync()
    {
        var items = await _service.GetOutOfStockItemsAsync();
        return Result<List<OutOfStockItemDto>>.Ok(items.Select(StockMapper.ToOutOfStockItem).ToList());
    }

    public async Task<Result<WarehouseStockDto>> GetWarehouseStockAsync(string warehouseCode)
    {
        var data = await _service.GetWarehouseStockDataAsync(warehouseCode);
        if (data is null)
        {
            return Result<WarehouseStockDto>.NotFound($"Warehouse '{warehouseCode}' not found.");
        }
        return Result<WarehouseStockDto>.Ok(StockMapper.ToWarehouseStock(data.Value));
    }

    public async Task<Result<object>> GetStockMovementsAsync(
        Guid? radiatorId, string? warehouseCode, DateTime? fromDate, DateTime? toDate,
        string? movementType, int? limit, int? pageNumber, int? pageSize)
    {
        if (pageNumber.HasValue || pageSize.HasValue)
        {
            var p = new PaginationParams { PageNumber = pageNumber ?? 1, PageSize = pageSize ?? 20 };
            var (items, totalCount) = await _service.GetStockMovementsPagedAsync(
                p.PageNumber, p.PageSize, radiatorId, warehouseCode, fromDate, toDate, movementType);

            return Result<object>.Ok(new PagedResult<StockMovementDto>
            {
                Items = items.Select(StockMapper.ToMovement).ToList(),
                PageNumber = p.PageNumber, PageSize = p.PageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)p.PageSize)
            });
        }

        var movements = await _service.GetStockMovementsAsync(radiatorId, warehouseCode, fromDate, toDate, movementType, limit);
        return Result<object>.Ok(movements.Select(StockMapper.ToMovement).ToList());
    }

    public async Task<Result<List<StockHistoryDto>>> GetStockHistoryAsync(
        Guid radiatorId, DateTime? fromDate, DateTime? toDate, string? warehouseCode)
    {
        if (!await _radiatorService.ExistsAsync(radiatorId))
        {
            return Result<List<StockHistoryDto>>.NotFound($"Radiator {radiatorId} not found.");
        }
        return Result<List<StockHistoryDto>>.Ok(new List<StockHistoryDto>());
    }
}
