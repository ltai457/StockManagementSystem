using Microsoft.EntityFrameworkCore;
using RadiatorStockAPI.Data;
using RadiatorStockAPI.DTOs.Common;
using RadiatorStockAPI.DTOs.Brands;
using RadiatorStockAPI.Models;

namespace RadiatorStockAPI.Services.Brands;

public interface ICreateBrandHandler
{
    Task<Result<BrandDto>> CreateAsync(CreateBrandDto dto);
}

public class CreateBrandHandler : ICreateBrandHandler
{
    private readonly RadiatorDbContext _context;

    public CreateBrandHandler(RadiatorDbContext context)
    {
        _context = context;
    }

    public async Task<Result<BrandDto>> CreateAsync(CreateBrandDto dto)
    {
        var name = dto.Name.Trim();
        if (string.IsNullOrWhiteSpace(name))
        {
            return Result<BrandDto>.Fail("Brand name is required.");
        }

        var existing = await _context.Brands
            .FirstOrDefaultAsync(b => b.Name.ToLower() == name.ToLower());

        if (existing != null)
        {
            if (!existing.IsActive)
            {
                existing.IsActive = true;
                existing.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return Result<BrandDto>.Ok(new BrandDto
            {
                Id = existing.Id,
                Name = existing.Name,
                IsActive = existing.IsActive
            });
        }

        var entity = new Brand
        {
            Id = Guid.NewGuid(),
            Name = name,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Brands.Add(entity);
        await _context.SaveChangesAsync();

        return Result<BrandDto>.Ok(new BrandDto
        {
            Id = entity.Id,
            Name = entity.Name,
            IsActive = entity.IsActive
        });
    }
}
