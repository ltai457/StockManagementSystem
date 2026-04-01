using Microsoft.EntityFrameworkCore;
using RadiatorStockAPI.Data;
using RadiatorStockAPI.Models;

namespace RadiatorStockAPI.Services.Radiators;

public class RadiatorDal : IRadiatorDal
{
    private readonly RadiatorDbContext _context;
    public RadiatorDal(RadiatorDbContext context) => _context = context;

    public async Task<List<Radiator>> GetAllWithStockAsync()
        => await _context.Radiators.AsNoTracking()
            .Include(r => r.StockLevels).ThenInclude(sl => sl.Warehouse)
            .OrderBy(r => r.Brand).ThenBy(r => r.Model).ToListAsync();

    public async Task<(List<Radiator> Items, int TotalCount)> GetPagedWithStockAsync(int pageNumber, int pageSize)
    {
        var query = _context.Radiators.AsNoTracking().Include(r => r.StockLevels).ThenInclude(sl => sl.Warehouse).OrderByDescending(r => r.UpdatedAt);
        var totalCount = await query.CountAsync();
        var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
        return (items, totalCount);
    }

    public async Task<Radiator?> GetByIdWithStockAsync(Guid id)
        => await _context.Radiators.AsNoTracking().Include(r => r.StockLevels).ThenInclude(sl => sl.Warehouse).FirstOrDefaultAsync(r => r.Id == id);

    public async Task<Radiator?> GetByIdAsync(Guid id)
        => await _context.Radiators.Include(r => r.StockLevels).ThenInclude(sl => sl.Warehouse).FirstOrDefaultAsync(r => r.Id == id);

    public async Task<List<Radiator>> GetByIdsWithStockAsync(List<Guid> ids)
        => await _context.Radiators.Include(r => r.StockLevels).ThenInclude(sl => sl.Warehouse).Where(r => ids.Contains(r.Id)).ToListAsync();

    public async Task AddAsync(Radiator radiator) { _context.Radiators.Add(radiator); await Task.CompletedTask; }

    public async Task AddStockLevelAsync(StockLevel stockLevel) { _context.StockLevels.Add(stockLevel); await Task.CompletedTask; }

    public async Task SaveChangesAsync() => await _context.SaveChangesAsync();

    public async Task<bool> RemoveAsync(Guid id)
    {
        var entity = await _context.Radiators.FirstOrDefaultAsync(r => r.Id == id);
        if (entity is null) return false;
        _context.Radiators.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(Guid id) => await _context.Radiators.AsNoTracking().AnyAsync(r => r.Id == id);

    public async Task<bool> CodeExistsAsync(string code, Guid? excludeId = null)
    {
        var query = _context.Radiators.AsNoTracking().Where(r => r.Code == code);
        if (excludeId.HasValue) query = query.Where(r => r.Id != excludeId.Value);
        return await query.AnyAsync();
    }
}
