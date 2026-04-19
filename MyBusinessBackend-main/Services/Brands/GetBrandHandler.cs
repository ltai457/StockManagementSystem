using Microsoft.EntityFrameworkCore;
using RadiatorStockAPI.Data;
using RadiatorStockAPI.DTOs.Common;
using RadiatorStockAPI.DTOs.Brands;

namespace RadiatorStockAPI.Services.Brands;

public interface IGetBrandHandler
{
    Task<Result<List<BrandDto>>> GetAllAsync();
}

public class GetBrandHandler : IGetBrandHandler
{
    private readonly RadiatorDbContext _context;

    public GetBrandHandler(RadiatorDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<BrandDto>>> GetAllAsync()
    {
        var items = await _context.Brands
            .AsNoTracking()
            .Where(b => b.IsActive)
            .OrderBy(b => b.Name)
            .Select(b => new BrandDto
            {
                Id = b.Id,
                Name = b.Name,
                IsActive = b.IsActive
            })
            .ToListAsync();

        return Result<List<BrandDto>>.Ok(items);
    }
}
