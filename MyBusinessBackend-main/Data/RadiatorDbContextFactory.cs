using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace RadiatorStockAPI.Data;

public sealed class RadiatorDbContextFactory : IDesignTimeDbContextFactory<RadiatorDbContext>
{
    public RadiatorDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<RadiatorDbContext>();
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? "Host=localhost;Database=radiatorstockdb;Username=postgres;Password=design-time-only;Port=5432";

        optionsBuilder
            .UseNpgsql(connectionString)
            .UseSnakeCaseNamingConvention();

        return new RadiatorDbContext(optionsBuilder.Options);
    }
}
