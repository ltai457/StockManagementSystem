using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RadiatorStockAPI.DTOs.Radiators;
using RadiatorStockAPI.Services.Radiators;

namespace RadiatorStockAPI.Controllers;

[Route("api/v1/radiators"), Authorize]
public class RadiatorsController : BaseController
{
    private readonly IGetRadiatorHandler _get;
    private readonly ICreateRadiatorHandler _create;
    private readonly IUpdateRadiatorHandler _update;

    public RadiatorsController(IGetRadiatorHandler get, ICreateRadiatorHandler create, IUpdateRadiatorHandler update)
    {
        _get = get;
        _create = create;
        _update = update;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? pageNumber, [FromQuery] int? pageSize)
        => Run(await _get.GetAllAsync(pageNumber, pageSize));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id) => Run(await _get.GetByIdAsync(id));

    [HttpPost, Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Create([FromBody] CreateRadiatorDto dto) => Run(await _create.CreateAsync(dto));

    [HttpPut("{id:guid}"), Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRadiatorDto dto) => Run(await _update.UpdateAsync(id, dto));

    [HttpDelete("{id:guid}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id) => Run(await _update.DeleteAsync(id));
}
