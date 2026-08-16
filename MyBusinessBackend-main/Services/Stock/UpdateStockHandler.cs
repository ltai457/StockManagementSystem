using RadiatorStockAPI.DTOs.Stock;
using RadiatorStockAPI.DTOs.Common;
using RadiatorStockAPI.Services.Radiators;

namespace RadiatorStockAPI.Services.Stock;

public interface IUpdateStockHandler
{
    Task<Result<object>> UpdateStockAsync(Guid radiatorId, UpdateStockDto dto, Guid actorId);
    Task<Result<BulkUpdateResultDto>> BulkUpdateStockAsync(BulkUpdateStockDto dto, Guid actorId);
    Task<Result<object>> AdjustStockAsync(StockAdjustmentDto dto, Guid actorId);
    Task<Result<object>> RecordStockInAsync(StockInDto dto, Guid actorId);
    Task<Result<object>> TransferStockAsync(StockTransferDto dto, Guid actorId);
    Task<Result<object>> RecordSaleAsync(StockSaleDto dto, Guid actorId);
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

    public async Task<Result<object>> UpdateStockAsync(Guid radiatorId, UpdateStockDto dto, Guid actorId)
    {
        if (!await _radiatorService.ExistsAsync(radiatorId))
        {
            return Result<object>.NotFound($"Radiator {radiatorId} not found.");
        }

        var success = await _service.UpdateStockAsync(radiatorId, dto.WarehouseCode, dto.Quantity, actorId);
        if (success)
        {
            return Result<object>.Ok(new { message = $"Stock updated for warehouse {dto.WarehouseCode}.", radiatorId, dto.WarehouseCode, dto.Quantity });
        }
        return Result<object>.Fail($"Failed to update stock. Check warehouse code '{dto.WarehouseCode}'.");
    }

    public async Task<Result<BulkUpdateResultDto>> BulkUpdateStockAsync(BulkUpdateStockDto dto, Guid actorId)
    {
        var (success, error, successCount, errorCount, errors) = await _service.BulkUpdateStockAsync(dto.Updates, actorId, dto.Reason);

        return Result<BulkUpdateResultDto>.Ok(new BulkUpdateResultDto
        {
            Committed = success,
            Message = success ? "All stock updates were committed." : error,
            SuccessCount = successCount, ErrorCount = errorCount,
            Errors = errors.Select(e => new BulkUpdateErrorDto
            {
                RadiatorId = e.RadiatorId, WarehouseCode = e.WarehouseCode, Error = e.Error
            }).ToList()
        });
    }

    public async Task<Result<object>> AdjustStockAsync(StockAdjustmentDto dto, Guid actorId)
    {
        var (success, error, radiatorId, warehouseCode, oldQty, newQty, reason) =
            await _service.AdjustStockAsync(dto.RadiatorId, dto.WarehouseCode, dto.NewQuantity, dto.Reason, actorId);

        if (success)
        {
            return Result<object>.Ok(new { message = "Stock adjustment completed.", radiatorId, warehouseCode, oldQuantity = oldQty, newQuantity = newQty, adjustmentReason = reason });
        }
        return Result<object>.Fail(error ?? "Adjustment failed.");
    }

    public async Task<Result<object>> RecordStockInAsync(StockInDto dto, Guid actorId)
    {
        if (!await _radiatorService.ExistsAsync(dto.RadiatorId))
        {
            return Result<object>.NotFound($"Radiator {dto.RadiatorId} not found.");
        }

        var (success, error, radiatorId, warehouseCode, quantityAdded, newQuantity, reason) =
            await _service.RecordStockInAsync(
                dto.RadiatorId,
                dto.WarehouseCode,
                dto.Quantity,
                dto.Reason,
                actorId
            );

        if (success)
        {
            return Result<object>.Ok(new
            {
                message = "Stock received.",
                radiatorId,
                warehouseCode,
                quantityAdded,
                newQuantity,
                reason
            });
        }

        return Result<object>.Fail(error ?? "Stock in failed.");
    }

    public async Task<Result<object>> TransferStockAsync(StockTransferDto dto, Guid actorId)
    {
        if (!await _radiatorService.ExistsAsync(dto.RadiatorId))
        {
            return Result<object>.NotFound($"Radiator {dto.RadiatorId} not found.");
        }

        var (success, error, radiatorId, fromWarehouseCode, toWarehouseCode, quantity) =
            await _service.TransferStockAsync(
                dto.RadiatorId,
                dto.FromWarehouseCode,
                dto.ToWarehouseCode,
                dto.Quantity,
                dto.Reason,
                actorId
            );

        if (success)
        {
            return Result<object>.Ok(new
            {
                message = "Stock transfer completed.",
                radiatorId,
                fromWarehouseCode,
                toWarehouseCode,
                quantity
            });
        }

        return Result<object>.Fail(error ?? "Transfer failed.");
    }

    public async Task<Result<object>> RecordSaleAsync(StockSaleDto dto, Guid actorId)
    {
        if (!await _radiatorService.ExistsAsync(dto.RadiatorId))
        {
            return Result<object>.NotFound($"Radiator {dto.RadiatorId} not found.");
        }

        var (success, error, radiatorId, warehouseCode, quantitySold, remainingQuantity, reason) =
            await _service.RecordSaleAsync(
                dto.RadiatorId,
                dto.WarehouseCode,
                dto.Quantity,
                dto.Reason,
                actorId
            );

        if (success)
        {
            return Result<object>.Ok(new
            {
                message = "Sale recorded and stock updated.",
                radiatorId,
                warehouseCode,
                quantitySold,
                remainingQuantity,
                reason
            });
        }

        return Result<object>.Fail(error ?? "Sale could not be recorded.");
    }
}
