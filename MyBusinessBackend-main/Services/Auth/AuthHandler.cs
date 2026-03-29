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
        if (result is null)
        {
            return Result<AuthResponseDto>.Unauthorized("Invalid username or password.");
        }
        return Result<AuthResponseDto>.Ok(ToResponse(result.Value));
    }

    public async Task<Result<AuthResponseDto>> RegisterAsync(RegisterRequestDto dto)
    {
        var result = await _service.RegisterAsync(dto.Username, dto.Email, dto.Password, dto.Role);
        if (result is null)
        {
            return Result<AuthResponseDto>.Conflict("Username or email already exists.");
        }
        return Result<AuthResponseDto>.Ok(ToResponse(result.Value));
    }

    public async Task<Result<AuthResponseDto>> RefreshTokenAsync(string refreshToken)
    {
        var result = await _service.RefreshTokenAsync(refreshToken);
        if (result is null)
        {
            return Result<AuthResponseDto>.Unauthorized("Invalid or expired refresh token.");
        }
        return Result<AuthResponseDto>.Ok(ToResponse(result.Value));
    }

    public async Task<Result<object>> LogoutAsync(string refreshToken)
    {
        var ok = await _service.RevokeTokenAsync(refreshToken);
        if (ok)
        {
            return Result<object>.Ok(new { message = "Logged out successfully." });
        }
        return Result<object>.Ok(new { message = "Token already invalid." });
    }

    public async Task<Result<object>> ChangePasswordAsync(Guid userId, ChangePasswordRequestDto dto)
    {
        var success = await _service.ChangePasswordAsync(userId, dto.CurrentPassword, dto.NewPassword);
        if (success)
        {
            return Result<object>.Ok(new { message = "Password changed." });
        }
        return Result<object>.Fail("Current password is incorrect.");
    }

    private static AuthResponseDto ToResponse((User User, string AccessToken, string RefreshToken, DateTime ExpiresAt) r) => new()
    {
        AccessToken = r.AccessToken,
        RefreshToken = r.RefreshToken,
        ExpiresAt = r.ExpiresAt,
        User = Users.UserMapper.ToDto(r.User)
    };
}
