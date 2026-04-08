using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RadiatorStockAPI.DTOs.ProductTypes;
using RadiatorStockAPI.Services.ProductTypes;

namespace RadiatorStockAPI.Controllers;

[Route("api/v1/product-types"), Authorize]
public class ProductTypesController : BaseController
{
    private readonly IGetProductTypeHandler _get;
    private readonly ICreateProductTypeHandler _create;
    private readonly IUpdateProductTypeHandler _update;

    public ProductTypesController(
        IGetProductTypeHandler get,
        ICreateProductTypeHandler create,
        IUpdateProductTypeHandler update)
    {
        _get = get;
        _create = create;
        _update = update;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Run(await _get.GetAllAsync());

    [HttpPost, Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Create([FromBody] CreateProductTypeDto dto) => Run(await _create.CreateAsync(dto));

    [HttpPut("{id:guid}"), Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductTypeDto dto) => Run(await _update.UpdateAsync(id, dto));

    [HttpDelete("{id:guid}"), Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Delete(Guid id) => Run(await _update.DeleteAsync(id));
}
