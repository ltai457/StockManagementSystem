using RadiatorStockAPI.DTOs.Stock;
using RadiatorStockAPI.DTOs.Common;
using RadiatorStockAPI.Services.Radiators;

namespace RadiatorStockAPI.Services.Stock;

public interface IUpdateStockHandler
{
    Task<Result<object>> UpdateStockAsync(Guid radiatorId, UpdateStockDto dto);
    Task<Result<BulkUpdateResultDto>> BulkUpdateStockAsync(BulkUpdateStockDto dto);
    Task<Result<object>> AdjustStockAsync(StockAdjustmentDto dto);
}

public class UpdateStockHandler : IUpdateStockHandler
{
    private readonly IStockService _service;
    private readonly IRadiatorService _radiatorService;

    public UpdateStockHandler(IStockService service, IRadiatorService radiatorService)
    {
        _service = service;
        _radiatorService = radiatorService;
    }

    public async Task<Result<object>> UpdateStockAsync(Guid radiatorId, UpdateStockDto dto)
    {
        if (!await _radiatorService.ExistsAsync(radiatorId))
            return Result<object>.NotFound($"Radiator {radiatorId} not found.");

        return await _service.UpdateStockAsync(radiatorId, dto.WarehouseCode, dto.Quantity)
            ? Result<object>.Ok(new { message = $"Stock updated for warehouse {dto.WarehouseCode}.", radiatorId, dto.WarehouseCode, dto.Quantity })
            : Result<object>.Fail($"Failed to update stock. Check warehouse code '{dto.WarehouseCode}'.");
    }

    public async Task<Result<BulkUpdateResultDto>> BulkUpdateStockAsync(BulkUpdateStockDto dto)
    {
        var (_, _, successCount, errorCount, errors) = await _service.BulkUpdateStockAsync(dto.Updates);

        return Result<BulkUpdateResultDto>.Ok(new BulkUpdateResultDto
        {
            SuccessCount = successCount, ErrorCount = errorCount,
            Errors = errors.Select(e => new BulkUpdateErrorDto
            {
                RadiatorId = e.RadiatorId, WarehouseCode = e.WarehouseCode, Error = e.Error
            }).ToList()
        });
    }

    public async Task<Result<object>> AdjustStockAsync(StockAdjustmentDto dto)
    {
        var (success, error, radiatorId, warehouseCode, oldQty, newQty, reason) =
            await _service.AdjustStockAsync(dto.RadiatorId, dto.WarehouseCode, dto.NewQuantity, dto.Reason);

        return success
            ? Result<object>.Ok(new { message = "Stock adjustment completed.", radiatorId, warehouseCode, oldQuantity = oldQty, newQuantity = newQty, adjustmentReason = reason })
            : Result<object>.Fail(error ?? "Adjustment failed.");
    }
}
