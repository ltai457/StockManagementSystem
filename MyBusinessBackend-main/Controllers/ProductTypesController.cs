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

    public ProductTypesController(IGetProductTypeHandler get, ICreateProductTypeHandler create)
    {
        _get = get;
        _create = create;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Run(await _get.GetAllAsync());

    [HttpPost, Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Create([FromBody] CreateProductTypeDto dto) => Run(await _create.CreateAsync(dto));
}
