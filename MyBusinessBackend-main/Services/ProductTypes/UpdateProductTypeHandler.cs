using Microsoft.EntityFrameworkCore;
using RadiatorStockAPI.Data;
using RadiatorStockAPI.DTOs.Common;
using RadiatorStockAPI.DTOs.ProductTypes;

namespace RadiatorStockAPI.Services.ProductTypes;

public interface IUpdateProductTypeHandler
{
    Task<Result<ProductTypeDto>> UpdateAsync(Guid id, UpdateProductTypeDto dto);
    Task<Result<bool>> DeleteAsync(Guid id);
}

public class UpdateProductTypeHandler : IUpdateProductTypeHandler
{
    private readonly RadiatorDbContext _context;

    public UpdateProductTypeHandler(RadiatorDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ProductTypeDto>> UpdateAsync(Guid id, UpdateProductTypeDto dto)
    {
        var name = dto.Name?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(name))
        {
            return Result<ProductTypeDto>.Fail("Type name is required.");
        }

        var entity = await _context.ProductTypes.FirstOrDefaultAsync(pt => pt.Id == id);
        if (entity is null)
        {
            return Result<ProductTypeDto>.Fail("Type not found.");
        }

        // Block rename to a name that already belongs to a different active type.
        var clash = await _context.ProductTypes
            .FirstOrDefaultAsync(pt => pt.Id != id && pt.Name.ToLower() == name.ToLower());
        if (clash != null)
        {
            return Result<ProductTypeDto>.Fail("A type with that name already exists.");
        }

        var oldName = entity.Name;
        entity.Name = name;
        entity.UpdatedAt = DateTime.UtcNow;

        // Keep existing radiators in sync so the rename is reflected everywhere
        // (radiators.type stores the type name as a free-form string).
        if (!string.Equals(oldName, name, StringComparison.Ordinal))
        {
            var affected = await _context.Radiators
                .Where(r => r.Type == oldName)
                .ToListAsync();
            foreach (var radiator in affected)
            {
                radiator.Type = name;
            }
        }

        await _context.SaveChangesAsync();

        return Result<ProductTypeDto>.Ok(new ProductTypeDto
        {
            Id = entity.Id,
            Name = entity.Name,
            IsActive = entity.IsActive
        });
    }

    public async Task<Result<bool>> DeleteAsync(Guid id)
    {
        var entity = await _context.ProductTypes.FirstOrDefaultAsync(pt => pt.Id == id);
        if (entity is null)
        {
            return Result<bool>.Fail("Type not found.");
        }

        // Soft delete — radiators that already reference this type by name keep
        // their value, but it disappears from the dropdown.
        entity.IsActive = false;
        entity.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Result<bool>.Ok(true);
    }
}
