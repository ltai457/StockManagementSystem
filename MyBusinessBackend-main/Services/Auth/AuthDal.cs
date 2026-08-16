using Microsoft.EntityFrameworkCore;
using RadiatorStockAPI.Data;
using RadiatorStockAPI.Models;

namespace RadiatorStockAPI.Services.Auth;

public class AuthDal : IAuthDal
{
    private readonly RadiatorDbContext _context;

    public AuthDal(RadiatorDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetActiveUserByUsernameAsync(string username)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Username == username && u.IsActive);
    }

    public async Task<RefreshToken?> GetRefreshTokenWithUserAsync(string token)
    {
        return await _context.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == token);
    }

    public async Task AddRefreshTokenAsync(RefreshToken token)
    {
        _context.RefreshTokens.Add(token);
        await Task.CompletedTask;
    }

    public async Task<RefreshToken?> GetRefreshTokenAsync(string token)
    {
        return await _context.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == token);
    }

    public async Task<List<RefreshToken>> GetActiveTokensByUserAsync(Guid userId)
    {
        return await _context.RefreshTokens
            .Where(rt => rt.UserId == userId && !rt.IsRevoked && rt.ExpiryDate > DateTime.UtcNow)
            .ToListAsync();
    }

    public async Task CleanupOldTokensAsync(Guid userId, int keepCount = 5)
    {
        var tokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == userId)
            .OrderByDescending(rt => rt.CreatedAt)
            .ToListAsync();

        var inactiveTokens = tokens
            .Where(rt => rt.IsRevoked || rt.ExpiryDate <= DateTime.UtcNow);

        var excessActiveTokens = tokens
            .Where(rt => !rt.IsRevoked && rt.ExpiryDate > DateTime.UtcNow)
            .OrderByDescending(rt => rt.CreatedAt)
            .Skip(Math.Max(keepCount - 1, 0))
            .ToList();

        _context.RefreshTokens.RemoveRange(inactiveTokens.Concat(excessActiveTokens));
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
