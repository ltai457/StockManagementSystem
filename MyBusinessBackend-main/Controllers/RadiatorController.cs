using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RadiatorStockAPI.DTOs.Radiators;
using RadiatorStockAPI.DTOs.Common;
using RadiatorStockAPI.Services.Radiators;

namespace RadiatorStockAPI.Controllers;

[Route("api/v1/radiators"), Authorize]
public class RadiatorsController : BaseController
{
    private readonly IGetRadiatorHandler _get;
    private readonly ICreateRadiatorHandler _create;
    private readonly IUpdateRadiatorHandler _update;
    private readonly IProductImageStore _imageStore;
    private readonly ILogger<RadiatorsController> _logger;

    public RadiatorsController(
        IGetRadiatorHandler get,
        ICreateRadiatorHandler create,
        IUpdateRadiatorHandler update,
        IProductImageStore imageStore,
        ILogger<RadiatorsController> logger)
    {
        _get = get;
        _create = create;
        _update = update;
        _imageStore = imageStore;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? pageNumber, [FromQuery] int? pageSize)
        => Run(await _get.GetAllAsync(pageNumber, pageSize));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id) => Run(await _get.GetByIdAsync(id));

    [HttpPost, Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Create([FromBody] CreateRadiatorDto dto)
    {
        try
        {
            return Run(await _create.CreateAsync(dto));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create radiator with code {Code}", dto.Code);

            var message = ex.InnerException?.Message ?? ex.Message;
            return StatusCode(500, new { message = $"Failed to create radiator: {message}" });
        }
    }

    [HttpPost("upload-image"), Authorize(Roles = "Admin,Staff")]
    [RequestSizeLimit(10_000_000)]
    public async Task<IActionResult> UploadImage(IFormFile file, CancellationToken cancellationToken)
    {
        if (file is null)
            return Run(Result<ImageUploadResponseDto>.Fail("Image file is required."));
        var error = await _imageStore.ValidateAsync(file, cancellationToken);
        if (error is not null)
            return Run(Result<ImageUploadResponseDto>.Fail(error));
        var image = await _imageStore.SaveAsync(file, cancellationToken);
        return Run(Result<ImageUploadResponseDto>.Ok(new ImageUploadResponseDto
        {
            ImageUrl = image.ImageUrl,
            FileName = image.FileName
        }));
    }

    [HttpPut("{id:guid}"), Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRadiatorDto dto) => Run(await _update.UpdateAsync(id, dto));

    [HttpDelete("{id:guid}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id) => Run(await _update.DeleteAsync(id));
}
