using RadiatorStockAPI.DTOs.Auth;
using RadiatorStockAPI.Models;

namespace RadiatorStockAPI.Services.Auth;

public interface IAuthService
{
    Task<(User User, string AccessToken, string RefreshToken, DateTime ExpiresAt)?> LoginAsync(string username, string password);
    Task<(User User, string AccessToken, string RefreshToken, DateTime ExpiresAt)?> RegisterAsync(string username, string email, string password, UserRole role);
    Task<(User User, string AccessToken, string RefreshToken, DateTime ExpiresAt)?> RefreshTokenAsync(string refreshToken);
    Task<bool> RevokeTokenAsync(string refreshToken);
    Task<bool> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword);
    Task<bool> ValidateTokenAsync(string token);
}
