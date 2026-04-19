using Microsoft.EntityFrameworkCore;
using RadiatorStockAPI.Data;
using RadiatorStockAPI.DTOs.Common;
using RadiatorStockAPI.DTOs.Brands;

namespace RadiatorStockAPI.Services.Brands;

public interface IUpdateBrandHandler
{
    Task<Result<BrandDto>> UpdateAsync(Guid id, UpdateBrandDto dto);
    Task<Result<bool>> DeleteAsync(Guid id);
}

public class UpdateBrandHandler : IUpdateBrandHandler
{
    private readonly RadiatorDbContext _context;

    public UpdateBrandHandler(RadiatorDbContext context)
    {
        _context = context;
    }

    public async Task<Result<BrandDto>> UpdateAsync(Guid id, UpdateBrandDto dto)
    {
        var name = dto.Name?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(name))
        {
            return Result<BrandDto>.Fail("Brand name is required.");
        }

        var entity = await _context.Brands.FirstOrDefaultAsync(b => b.Id == id);
        if (entity is null)
        {
            return Result<BrandDto>.Fail("Brand not found.");
        }

        // Block rename to a name that already belongs to a different active brand.
        var clash = await _context.Brands
            .FirstOrDefaultAsync(b => b.Id != id && b.Name.ToLower() == name.ToLower());
        if (clash != null)
        {
            return Result<BrandDto>.Fail("A brand with that name already exists.");
        }

        var oldName = entity.Name;
        entity.Name = name;
        entity.UpdatedAt = DateTime.UtcNow;

        // Keep existing radiators in sync so the rename is reflected everywhere
        // (radiators.brand stores the brand name as a free-form string).
        if (!string.Equals(oldName, name, StringComparison.Ordinal))
        {
            var affected = await _context.Radiators
                .Where(r => r.Brand == oldName)
                .ToListAsync();
            foreach (var radiator in affected)
            {
                radiator.Brand = name;
            }
        }

        await _context.SaveChangesAsync();

        return Result<BrandDto>.Ok(new BrandDto
        {
            Id = entity.Id,
            Name = entity.Name,
            IsActive = entity.IsActive
        });
    }

    public async Task<Result<bool>> DeleteAsync(Guid id)
    {
        var entity = await _context.Brands.FirstOrDefaultAsync(b => b.Id == id);
        if (entity is null)
        {
            return Result<bool>.Fail("Brand not found.");
        }

        // Soft delete — radiators that already reference this brand by name keep
        // their value, but it disappears from the dropdown.
        entity.IsActive = false;
        entity.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Result<bool>.Ok(true);
    }
}
