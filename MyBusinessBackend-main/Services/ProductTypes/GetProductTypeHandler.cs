using Microsoft.EntityFrameworkCore;
using RadiatorStockAPI.Data;
using RadiatorStockAPI.DTOs.Common;
using RadiatorStockAPI.DTOs.ProductTypes;

namespace RadiatorStockAPI.Services.ProductTypes;

public interface IGetProductTypeHandler
{
    Task<Result<List<ProductTypeDto>>> GetAllAsync();
}

public class GetProductTypeHandler : IGetProductTypeHandler
{
    private readonly RadiatorDbContext _context;

    public GetProductTypeHandler(RadiatorDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<ProductTypeDto>>> GetAllAsync()
    {
        var items = await _context.ProductTypes
            .AsNoTracking()
            .Where(pt => pt.IsActive)
            .OrderBy(pt => pt.Name)
            .Select(pt => new ProductTypeDto
            {
                Id = pt.Id,
                Name = pt.Name,
                IsActive = pt.IsActive
            })
            .ToListAsync();

        return Result<List<ProductTypeDto>>.Ok(items);
    }
}
