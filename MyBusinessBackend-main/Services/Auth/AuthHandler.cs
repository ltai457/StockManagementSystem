using RadiatorStockAPI.DTOs.Auth;
using RadiatorStockAPI.DTOs.Common;
using RadiatorStockAPI.Models;
namespace RadiatorStockAPI.Services.Auth;

public class AuthHandler : IAuthHandler
{
    private readonly IAuthService _service;
    public AuthHandler(IAuthService service) => _service = service;

    public async Task<Result<AuthResponseDto>> LoginAsync(LoginRequestDto dto)
    {
        var result = await _service.LoginAsync(dto.Username, dto.Password);
        return result is null
            ? Result<AuthResponseDto>.Unauthorized("Invalid username or password.")
            : Result<AuthResponseDto>.Ok(ToResponse(result.Value));
    }

    public async Task<Result<AuthResponseDto>> RegisterAsync(RegisterRequestDto dto)
    {
        var result = await _service.RegisterAsync(dto.Username, dto.Email, dto.Password, dto.Role);
        return result is null
            ? Result<AuthResponseDto>.Conflict("Username or email already exists.")
            : Result<AuthResponseDto>.Ok(ToResponse(result.Value));
    }

    public async Task<Result<AuthResponseDto>> RefreshTokenAsync(string refreshToken)
    {
        var result = await _service.RefreshTokenAsync(refreshToken);
        return result is null
            ? Result<AuthResponseDto>.Unauthorized("Invalid or expired refresh token.")
            : Result<AuthResponseDto>.Ok(ToResponse(result.Value));
    }

    public async Task<Result<object>> LogoutAsync(string refreshToken)
    {
        var ok = await _service.RevokeTokenAsync(refreshToken);
        return Result<object>.Ok(new { message = ok ? "Logged out successfully." : "Token already invalid." });
    }

    public async Task<Result<object>> ChangePasswordAsync(Guid userId, ChangePasswordRequestDto dto)
    {
        return await _service.ChangePasswordAsync(userId, dto.CurrentPassword, dto.NewPassword)
            ? Result<object>.Ok(new { message = "Password changed." })
            : Result<object>.Fail("Current password is incorrect.");
    }

    private static AuthResponseDto ToResponse((User User, string AccessToken, string RefreshToken, DateTime ExpiresAt) r) => new()
    {
        AccessToken = r.AccessToken,
        RefreshToken = r.RefreshToken,
        ExpiresAt = r.ExpiresAt,
        User = Users.UserMapper.ToDto(r.User)
    };
}
