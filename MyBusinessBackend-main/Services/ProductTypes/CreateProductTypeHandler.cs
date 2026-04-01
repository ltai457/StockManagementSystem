using Microsoft.EntityFrameworkCore;
using RadiatorStockAPI.Data;
using RadiatorStockAPI.DTOs.Common;
using RadiatorStockAPI.DTOs.ProductTypes;
using RadiatorStockAPI.Models;

namespace RadiatorStockAPI.Services.ProductTypes;

public interface ICreateProductTypeHandler
{
    Task<Result<ProductTypeDto>> CreateAsync(CreateProductTypeDto dto);
}

public class CreateProductTypeHandler : ICreateProductTypeHandler
{
    private readonly RadiatorDbContext _context;

    public CreateProductTypeHandler(RadiatorDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ProductTypeDto>> CreateAsync(CreateProductTypeDto dto)
    {
        var name = dto.Name.Trim();
        if (string.IsNullOrWhiteSpace(name))
        {
            return Result<ProductTypeDto>.Fail("Type name is required.");
        }

        var existing = await _context.ProductTypes
            .FirstOrDefaultAsync(pt => pt.Name.ToLower() == name.ToLower());

        if (existing != null)
        {
            if (!existing.IsActive)
            {
                existing.IsActive = true;
                existing.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return Result<ProductTypeDto>.Ok(new ProductTypeDto
            {
                Id = existing.Id,
                Name = existing.Name,
                IsActive = existing.IsActive
            });
        }

        var entity = new ProductType
        {
            Id = Guid.NewGuid(),
            Name = name,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.ProductTypes.Add(entity);
        await _context.SaveChangesAsync();

        return Result<ProductTypeDto>.Ok(new ProductTypeDto
        {
            Id = entity.Id,
            Name = entity.Name,
            IsActive = entity.IsActive
        });
    }
}
