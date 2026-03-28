using RadiatorStockAPI.DTOs.Users;
using RadiatorStockAPI.Models;

namespace RadiatorStockAPI.Services.Users;

public static class UserMapper
{
    public static UserDto ToDto(User u) => new()
    {
        Id = u.Id, Username = u.Username, Email = u.Email,
        FirstName = u.FirstName, LastName = u.LastName,
        Role = u.Role, IsActive = u.IsActive,
        CreatedAt = u.CreatedAt, UpdatedAt = u.UpdatedAt
    };
}
