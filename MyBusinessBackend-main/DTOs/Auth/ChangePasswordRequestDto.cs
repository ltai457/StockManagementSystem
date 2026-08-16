using System.ComponentModel.DataAnnotations;

namespace RadiatorStockAPI.DTOs.Auth;

public class ChangePasswordRequestDto
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 12)]
    [RegularExpression(
        @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$",
        ErrorMessage =
            "Password must be at least 12 characters and contain lowercase, uppercase, a digit, and a special character.")]
    public string NewPassword { get; set; } = string.Empty;
}
