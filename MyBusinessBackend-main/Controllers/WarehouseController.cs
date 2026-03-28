using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RadiatorStockAPI.DTOs.Warehouses;
using RadiatorStockAPI.Services.Warehouses;

namespace RadiatorStockAPI.Controllers;

[Route("api/v1/warehouses"), Authorize]
public class WarehousesController : BaseController
{
    private readonly IGetWarehouseHandler _get;
    private readonly ICreateWarehouseHandler _create;
    private readonly IUpdateWarehouseHandler _update;

    public WarehousesController(IGetWarehouseHandler get, ICreateWarehouseHandler create, IUpdateWarehouseHandler update)
    {
        _get = get;
        _create = create;
        _update = update;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Run(await _get.GetAllAsync());

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id) => Run(await _get.GetByIdAsync(id));

    [HttpPost, Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Create([FromBody] CreateWarehouseDto dto) => Run(await _create.CreateAsync(dto));

    [HttpPut("{id:guid}"), Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateWarehouseDto dto) => Run(await _update.UpdateAsync(id, dto));

    [HttpDelete("{id:guid}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id) => Run(await _update.DeleteAsync(id));
}
