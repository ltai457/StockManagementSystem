using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using RadiatorStockAPI.Models;
using RadiatorStockAPI.Services.Users;

namespace RadiatorStockAPI.Services.Auth;

public class AuthService : IAuthService
{
    private readonly IAuthDal _dal;
    private readonly IUserService _userService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;

    public AuthService(IAuthDal dal, IUserService userService, IConfiguration configuration, ILogger<AuthService> logger)
    {
        _dal = dal;
        _userService = userService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<(User User, string AccessToken, string RefreshToken, DateTime ExpiresAt)?> LoginAsync(string username, string password)
    {
        try
        {
            var user = await _dal.GetActiveUserByUsernameAsync(username);
            if (user is null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            {
                _logger.LogWarning("Login failed for: {Username}", username);
                return null;
            }
            user.UpdatedAt = DateTime.UtcNow;
            await _dal.CleanupOldTokensAsync(user.Id);
            var (accessToken, refreshToken, expiresAt) = await CreateTokenPairAsync(user);
            _logger.LogInformation("Login successful: {Username}", username);
            return (user, accessToken, refreshToken, expiresAt);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login: {Username}", username);
            return null;
        }
    }

    public async Task<(User User, string AccessToken, string RefreshToken, DateTime ExpiresAt)?> RegisterAsync(string username, string email, string password, UserRole role)
    {
        try
        {
            if (await _userService.UsernameExistsAsync(username) || await _userService.EmailExistsAsync(email))
                return null;
            var user = await _userService.CreateAsync(username, email, password, role);
            if (user is null) return null;
            var (accessToken, refreshToken, expiresAt) = await CreateTokenPairAsync(user);
            _logger.LogInformation("Registration successful: {Username}", username);
            return (user, accessToken, refreshToken, expiresAt);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration: {Username}", username);
            return null;
        }
    }

    public async Task<(User User, string AccessToken, string RefreshToken, DateTime ExpiresAt)?> RefreshTokenAsync(string refreshToken)
    {
        try
        {
            var tokenEntity = await _dal.GetRefreshTokenWithUserAsync(refreshToken);
            if (tokenEntity is null || tokenEntity.IsRevoked || !tokenEntity.User.IsActive)
                return null;
            tokenEntity.IsRevoked = true;
            var (accessToken, newRefreshToken, expiresAt) = await CreateTokenPairAsync(tokenEntity.User);
            return (tokenEntity.User, accessToken, newRefreshToken, expiresAt);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during token refresh");
            return null;
        }
    }

    public async Task<bool> RevokeTokenAsync(string refreshToken)
    {
        try
        {
            var token = await _dal.GetRefreshTokenAsync(refreshToken);
            if (token is null) return false;
            token.IsRevoked = true;
            await _dal.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error revoking token");
            return false;
        }
    }

    public async Task<bool> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword)
    {
        try
        {
            var user = await _userService.GetByIdAsync(userId);
            if (user is null || !BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
                return false;
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            user.UpdatedAt = DateTime.UtcNow;
            var activeTokens = await _dal.GetActiveTokensByUserAsync(userId);
            foreach (var t in activeTokens) t.IsRevoked = true;
            await _dal.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password: {UserId}", userId);
            return false;
        }
    }

    public Task<bool> ValidateTokenAsync(string token)
    {
        try
        {
            var key = Encoding.UTF8.GetBytes(_configuration["JWT:Secret"]!);
            new JwtSecurityTokenHandler().ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true, IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true, ValidIssuer = _configuration["JWT:Issuer"],
                ValidateAudience = true, ValidAudience = _configuration["JWT:Audience"],
                ValidateLifetime = true, ClockSkew = TimeSpan.Zero
            }, out _);
            return Task.FromResult(true);
        }
        catch { return Task.FromResult(false); }
    }

    private async Task<(string AccessToken, string RefreshToken, DateTime ExpiresAt)> CreateTokenPairAsync(User user)
    {
        var accessToken = GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken();
        await _dal.AddRefreshTokenAsync(new RefreshToken
        {
            Id = Guid.NewGuid(), Token = refreshToken, UserId = user.Id,
            CreatedAt = DateTime.UtcNow, IsRevoked = false
        });
        await _dal.SaveChangesAsync();
        return (accessToken, refreshToken, DateTime.UtcNow.AddMinutes(GetExpirationMinutes()));
    }

    private string GenerateJwtToken(User user)
    {
        var key = Encoding.UTF8.GetBytes(_configuration["JWT:Secret"]!);
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role.ToString())
        };
        if (!string.IsNullOrWhiteSpace(user.FirstName) || !string.IsNullOrWhiteSpace(user.LastName))
            claims.Add(new Claim("fullname", $"{user.FirstName} {user.LastName}".Trim()));

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(GetExpirationMinutes()),
            Issuer = _configuration["JWT:Issuer"],
            Audience = _configuration["JWT:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var handler = new JwtSecurityTokenHandler();
        return handler.WriteToken(handler.CreateToken(tokenDescriptor));
    }

    private static string GenerateRefreshToken()
    {
        var bytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes);
    }

    private int GetExpirationMinutes() => _configuration.GetValue<int>("JWT:AccessTokenExpirationMinutes", 15);
}
