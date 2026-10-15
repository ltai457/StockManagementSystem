using System.Text;
using Microsoft.AspNetCore.Http;
using RadiatorStockAPI.Services.Radiators;
using Xunit;

namespace MyBusinessBackend.Tests;

public sealed class ProductImageStoreTests
{
    [Theory]
    [InlineData("photo.jpg")]
    [InlineData("photo.svg")]
    [InlineData("photo.png")]
    public async Task RenamedNonImagesAreRejected(string name)
    {
        var store = new ProductImageStore(null!, null!);
        var bytes = Encoding.UTF8.GetBytes("<html>not an image</html>");
        var photo = new FormFile(new MemoryStream(bytes), 0, bytes.Length, "file", name);

        Assert.NotNull(await store.ValidateAsync(photo, CancellationToken.None));
    }

    [Fact]
    public async Task ValidPngSignatureIsAccepted()
    {
        var store = new ProductImageStore(null!, null!);
        var bytes = Convert.FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a+1cAAAAASUVORK5CYII=");
        var photo = new FormFile(new MemoryStream(bytes), 0, bytes.Length, "file", "photo.PNG");

        Assert.Null(await store.ValidateAsync(photo, CancellationToken.None));
    }
}
