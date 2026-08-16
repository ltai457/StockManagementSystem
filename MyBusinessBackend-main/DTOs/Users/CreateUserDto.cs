using System.ComponentModel.DataAnnotations;
using RadiatorStockAPI.Models;

namespace RadiatorStockAPI.DTOs.Users;

public class CreateUserDto
{
    [Required(ErrorMessage = "Username is required")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 50 characters")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required")]
    [StringLength(100, MinimumLength = 12, ErrorMessage = "Password must be at least 12 characters")]
    [RegularExpression(
        @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$",
        ErrorMessage = "Password must contain lowercase, uppercase, a digit, and a special character")]
    public string Password { get; set; } = string.Empty;

    [StringLength(100, ErrorMessage = "First name cannot exceed 100 characters")]
    public string? FirstName { get; set; }

    [StringLength(100, ErrorMessage = "Last name cannot exceed 100 characters")]
    public string? LastName { get; set; }

    [Required(ErrorMessage = "Role is required")]
    [EnumDataType(typeof(UserRole), ErrorMessage = "Role must be Admin or Staff")]
    public UserRole Role { get; set; }
}
