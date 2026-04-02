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
    private readonly IWebHostEnvironment _environment;
    private readonly IConfiguration _configuration;
    private readonly ILogger<RadiatorsController> _logger;

    public RadiatorsController(
        IGetRadiatorHandler get,
        ICreateRadiatorHandler create,
        IUpdateRadiatorHandler update,
        IWebHostEnvironment environment,
        IConfiguration configuration,
        ILogger<RadiatorsController> logger)
    {
        _get = get;
        _create = create;
        _update = update;
        _environment = environment;
        _configuration = configuration;
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
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return Run(Result<ImageUploadResponseDto>.Fail("Image file is required."));
        }

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
        {
            return Run(Result<ImageUploadResponseDto>.Fail("Only jpg, jpeg, png, webp, and gif files are allowed."));
        }

        var uploadRootPath =
            Environment.GetEnvironmentVariable("UPLOADS_ROOT_PATH")
            ?? _configuration["Uploads:RootPath"]
            ?? Path.Combine(_environment.ContentRootPath, "wwwroot", "uploads");

        var uploadRequestPath =
            Environment.GetEnvironmentVariable("UPLOADS_REQUEST_PATH")
            ?? _configuration["Uploads:RequestPath"]
            ?? "/uploads";

        var uploadsDirectory = Path.Combine(uploadRootPath, "radiators");
        Directory.CreateDirectory(uploadsDirectory);

        var fileName = $"{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(uploadsDirectory, fileName);

        await using (var stream = System.IO.File.Create(filePath))
        {
            await file.CopyToAsync(stream);
        }

        var normalizedRequestPath = uploadRequestPath.StartsWith('/')
            ? uploadRequestPath
            : $"/{uploadRequestPath}";

        var imageUrl = $"{Request.Scheme}://{Request.Host}{normalizedRequestPath}/radiators/{fileName}";
        return Run(Result<ImageUploadResponseDto>.Ok(new ImageUploadResponseDto
        {
            ImageUrl = imageUrl,
            FileName = fileName
        }));
    }

    [HttpPut("{id:guid}"), Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRadiatorDto dto) => Run(await _update.UpdateAsync(id, dto));

    [HttpDelete("{id:guid}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id) => Run(await _update.DeleteAsync(id));
}
