using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RadiatorStockAPI.DTOs.Auth;
using RadiatorStockAPI.DTOs.Common;
using RadiatorStockAPI.Services.Auth;

namespace RadiatorStockAPI.Controllers;

[Route("api/v1/auth")]
public class AuthController : BaseController
{
    private readonly IAuthHandler _handler;
    public AuthController(IAuthHandler handler) => _handler = handler;

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
        => Run(await _handler.LoginAsync(dto));

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
        => Run(await _handler.RegisterAsync(dto));

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequestDto dto)
        => Run(await _handler.RefreshTokenAsync(dto.RefreshToken));

    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenRequestDto dto)
        => Run(await _handler.LogoutAsync(dto.RefreshToken));

    [HttpPost("change-password"), Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto dto)
        => Run(await _handler.ChangePasswordAsync(GetUserId(), dto));

    [HttpGet("me"), Authorize]
    public IActionResult Me()
        => Run(Result<object>.Ok(new { id = GetUserId(), username = GetUsername(), email = GetEmail(), role = GetRole() }));
}
