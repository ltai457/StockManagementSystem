using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RadiatorStockAPI.DTOs.Stock;
using RadiatorStockAPI.Services.Stock;

namespace RadiatorStockAPI.Controllers;

[Route("api/v1"), Authorize]
public class StockController : BaseController
{
    private readonly IGetStockHandler _get;
    private readonly IUpdateStockHandler _update;

    public StockController(IGetStockHandler get, IUpdateStockHandler update)
    {
        _get = get;
        _update = update;
    }

    [HttpGet("radiators/{radiatorId:guid}/stock")]
    public async Task<IActionResult> GetRadiatorStock(Guid radiatorId)
        => Run(await _get.GetRadiatorStockAsync(radiatorId));

    [HttpPost("radiators/{radiatorId:guid}/stock"), Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> UpdateStock(Guid radiatorId, [FromBody] UpdateStockDto dto)
        => Run(await _update.UpdateStockAsync(radiatorId, dto, GetUserId()));

    [HttpGet("stock/summary")]
    public async Task<IActionResult> GetSummary()
        => Run(await _get.GetStockSummaryAsync());

    [HttpGet("stock/all-radiators")]
    public async Task<IActionResult> GetAllWithStock([FromQuery] string? search, [FromQuery] bool lowStockOnly = false,
        [FromQuery] string? warehouseCode = null, [FromQuery] int? pageNumber = null, [FromQuery] int? pageSize = null)
        => Run(await _get.GetAllRadiatorsWithStockAsync(search, lowStockOnly, warehouseCode, pageNumber, pageSize));

    [HttpGet("stock/low-stock")]
    public async Task<IActionResult> GetLowStock([FromQuery] int threshold = StockAlertSettings.LowStockThreshold)
        => Run(await _get.GetLowStockItemsAsync(threshold));

    [HttpGet("stock/out-of-stock")]
    public async Task<IActionResult> GetOutOfStock()
        => Run(await _get.GetOutOfStockItemsAsync());

    [HttpPost("stock/bulk-update"), Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> BulkUpdate([FromBody] BulkUpdateStockDto dto)
        => Run(await _update.BulkUpdateStockAsync(dto, GetUserId()));

    [HttpGet("stock/warehouse/{warehouseCode}")]
    public async Task<IActionResult> GetWarehouseStock(string warehouseCode)
        => Run(await _get.GetWarehouseStockAsync(warehouseCode));

    [HttpGet("stock/history/{radiatorId:guid}")]
    public async Task<IActionResult> GetHistory(Guid radiatorId, [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate, [FromQuery] string? warehouseCode)
        => Run(await _get.GetStockHistoryAsync(radiatorId, fromDate, toDate, warehouseCode));

    [HttpPost("stock/adjust"), Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Adjust([FromBody] StockAdjustmentDto dto)
        => Run(await _update.AdjustStockAsync(dto, GetUserId()));

    [HttpPost("stock/in"), Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> StockIn([FromBody] StockInDto dto)
        => Run(await _update.RecordStockInAsync(dto, GetUserId()));

    [HttpPost("stock/transfer"), Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Transfer([FromBody] StockTransferDto dto)
        => Run(await _update.TransferStockAsync(dto, GetUserId()));

    [HttpPost("stock/sell"), Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Sell([FromBody] StockSaleDto dto)
        => Run(await _update.RecordSaleAsync(dto, GetUserId()));

    [HttpGet("stock/movements")]
    public async Task<IActionResult> GetMovements([FromQuery] Guid? radiatorId, [FromQuery] string? warehouseCode,
        [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] string? movementType,
        [FromQuery] int? limit = 100, [FromQuery] int? pageNumber = null, [FromQuery] int? pageSize = null)
        => Run(await _get.GetStockMovementsAsync(radiatorId, warehouseCode, fromDate, toDate, movementType, limit, pageNumber, pageSize));
}
