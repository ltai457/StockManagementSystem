namespace RadiatorStockAPI.Services.Radiators;

public sealed record StoredProductImage(string ImageUrl, string FileName);

public interface IProductImageStore
{
    Task<string?> ValidateAsync(IFormFile file, CancellationToken cancellationToken);
    Task<StoredProductImage> SaveAsync(IFormFile file, CancellationToken cancellationToken);
}

public sealed class ProductImageStore(IWebHostEnvironment environment, IConfiguration configuration) : IProductImageStore
{
    public const long MaxImageBytes = 8_000_000;

    public static string RootPath(IWebHostEnvironment environment, IConfiguration configuration)
    {
        var configured = Environment.GetEnvironmentVariable("UPLOADS_ROOT_PATH") ?? configuration["Uploads:RootPath"];
        return Path.GetFullPath(string.IsNullOrWhiteSpace(configured)
            ? Path.Combine(environment.ContentRootPath, "wwwroot", "uploads")
            : Path.IsPathRooted(configured) ? configured : Path.Combine(environment.ContentRootPath, configured));
    }

    public static string RequestPath(IConfiguration configuration)
    {
        var configured = Environment.GetEnvironmentVariable("UPLOADS_REQUEST_PATH") ?? configuration["Uploads:RequestPath"];
        return string.IsNullOrWhiteSpace(configured) ? "/uploads" : "/" + configured.Trim('/');
    }

    public async Task<string?> ValidateAsync(IFormFile file, CancellationToken cancellationToken)
    {
        if (file.Length == 0 || file.Length > MaxImageBytes)
            return "Each photo must be non-empty and no larger than 8 MB.";

        var header = new byte[12];
        await using var stream = file.OpenReadStream();
        var length = await stream.ReadAtLeastAsync(header, header.Length, throwOnEndOfStream: false, cancellationToken);
        var valid = Path.GetExtension(file.FileName).ToLowerInvariant() switch
        {
            ".jpg" or ".jpeg" => length >= 3 && header[0] == 0xff && header[1] == 0xd8 && header[2] == 0xff,
            ".png" => length >= 8 && header.AsSpan(0, 8).SequenceEqual(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }),
            ".gif" => length >= 6 && (header.AsSpan(0, 6).SequenceEqual("GIF87a"u8) || header.AsSpan(0, 6).SequenceEqual("GIF89a"u8)),
            ".webp" => length >= 12 && header.AsSpan(0, 4).SequenceEqual("RIFF"u8) && header.AsSpan(8, 4).SequenceEqual("WEBP"u8),
            _ => false
        };
        return valid ? null : "Photo must be a JPG, PNG, GIF, or WebP with a matching file signature.";
    }

    public async Task<StoredProductImage> SaveAsync(IFormFile file, CancellationToken cancellationToken)
    {
        var directory = Path.Combine(RootPath(environment, configuration), "radiators");
        Directory.CreateDirectory(directory);
        var name = $"{Guid.NewGuid():N}{Path.GetExtension(file.FileName).ToLowerInvariant()}";
        var image = new StoredProductImage($"{RequestPath(configuration)}/radiators/{name}", name);
        try
        {
            await using var stream = new FileStream(Path.Combine(directory, name), FileMode.CreateNew, FileAccess.Write);
            await file.CopyToAsync(stream, cancellationToken);
            return image;
        }
        catch
        {
            Delete(image);
            throw;
        }
    }

    private void Delete(StoredProductImage image)
        => File.Delete(Path.Combine(RootPath(environment, configuration), "radiators", image.FileName));
}
