using System.ComponentModel.DataAnnotations;
using RadiatorStockAPI.Models;

namespace RadiatorStockAPI.DTOs.Auth;

public class RegisterRequestDto
{
    [Required]
    [StringLength(50, MinimumLength = 3)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 12)]
    [RegularExpression(
        @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$",
        ErrorMessage =
            "Password must be at least 12 characters and contain lowercase, uppercase, a digit, and a special character.")]
    public string Password { get; set; } = string.Empty;

    [Required]
    [EnumDataType(typeof(UserRole))]
    public UserRole Role { get; set; }
}
