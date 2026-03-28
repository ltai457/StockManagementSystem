using RadiatorStockAPI.Models;

namespace RadiatorStockAPI.Services.Auth;

public interface IAuthDal
{
    Task<User?> GetActiveUserByUsernameAsync(string username);
    Task<RefreshToken?> GetRefreshTokenWithUserAsync(string token);
    Task AddRefreshTokenAsync(RefreshToken token);
    Task<RefreshToken?> GetRefreshTokenAsync(string token);
    Task<List<RefreshToken>> GetActiveTokensByUserAsync(Guid userId);
    Task CleanupOldTokensAsync(Guid userId, int keepCount = 5);
    Task SaveChangesAsync();
}
