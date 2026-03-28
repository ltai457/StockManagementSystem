using RadiatorStockAPI.DTOs.Auth;
using RadiatorStockAPI.DTOs.Common;

namespace RadiatorStockAPI.Services.Auth;

public interface IAuthHandler
{
    Task<Result<AuthResponseDto>> LoginAsync(LoginRequestDto dto);
    Task<Result<AuthResponseDto>> RegisterAsync(RegisterRequestDto dto);
    Task<Result<AuthResponseDto>> RefreshTokenAsync(string refreshToken);
    Task<Result<object>> LogoutAsync(string refreshToken);
    Task<Result<object>> ChangePasswordAsync(Guid userId, ChangePasswordRequestDto dto);
}
