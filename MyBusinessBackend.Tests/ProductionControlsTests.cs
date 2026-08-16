using System.ComponentModel.DataAnnotations;
using System.Reflection;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using RadiatorStockAPI.Controllers;
using RadiatorStockAPI.Data;
using RadiatorStockAPI.DTOs.Auth;
using RadiatorStockAPI.DTOs.Stock;
using RadiatorStockAPI.Models;
using Xunit;

namespace MyBusinessBackend.Tests;

public sealed class ProductionControlsTests
{
    [Fact]
    public void RegistrationRequiresAdministratorRole()
    {
        var action = typeof(AuthController).GetMethod(nameof(AuthController.Register));
        var authorization = action?.GetCustomAttribute<AuthorizeAttribute>();

        Assert.NotNull(authorization);
        Assert.Equal("Admin", authorization.Roles);
    }

    [Theory]
    [InlineData(typeof(StockInDto))]
    [InlineData(typeof(StockSaleDto))]
    [InlineData(typeof(StockTransferDto))]
    [InlineData(typeof(StockAdjustmentDto))]
    [InlineData(typeof(BulkUpdateStockDto))]
    public void StockRequestsCannotSupplyAuditUser(Type requestType)
    {
        Assert.Null(requestType.GetProperty("UpdatedBy"));
    }

    [Theory]
    [InlineData("Short1!", false)]
    [InlineData("alllowercase1!", false)]
    [InlineData("StrongPassword1!", true)]
    public void RegistrationEnforcesPasswordPolicy(string password, bool expectedValid)
    {
        var request = new RegisterRequestDto
        {
            Username = "new-user",
            Email = "new-user@example.com",
            Password = password,
            Role = UserRole.Staff
        };
        var results = new List<ValidationResult>();

        var isValid = Validator.TryValidateObject(request, new ValidationContext(request), results, true);

        Assert.Equal(expectedValid, isValid);
    }

    [Fact]
    public void ExpiredRefreshTokenIsInactive()
    {
        var token = new RefreshToken
        {
            ExpiryDate = DateTime.UtcNow.AddSeconds(-1),
            IsRevoked = false
        };

        Assert.True(token.IsExpired);
        Assert.False(token.IsActive);
    }

    [Fact]
    public void StockVersionUsesPostgresOptimisticConcurrency()
    {
        var options = new DbContextOptionsBuilder<RadiatorDbContext>()
            .UseNpgsql("Host=localhost;Database=model-test;Username=test;Password=test")
            .UseSnakeCaseNamingConvention()
            .Options;
        using var context = new RadiatorDbContext(options);

        var version = context.Model.FindEntityType(typeof(StockLevel))?.FindProperty(nameof(StockLevel.Version));

        Assert.NotNull(version);
        Assert.True(version.IsConcurrencyToken);
        Assert.Equal("xmin", version.GetColumnName());
    }
}
