using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RadiatorStockAPI.DTOs.Brands;
using RadiatorStockAPI.Services.Brands;

namespace RadiatorStockAPI.Controllers;

[Route("api/v1/brands"), Authorize]
public class BrandsController : BaseController
{
    private readonly IGetBrandHandler _get;
    private readonly ICreateBrandHandler _create;
    private readonly IUpdateBrandHandler _update;

    public BrandsController(
        IGetBrandHandler get,
        ICreateBrandHandler create,
        IUpdateBrandHandler update)
    {
        _get = get;
        _create = create;
        _update = update;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Run(await _get.GetAllAsync());

    [HttpPost, Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Create([FromBody] CreateBrandDto dto) => Run(await _create.CreateAsync(dto));

    [HttpPut("{id:guid}"), Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateBrandDto dto) => Run(await _update.UpdateAsync(id, dto));

    [HttpDelete("{id:guid}"), Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Delete(Guid id) => Run(await _update.DeleteAsync(id));
}
