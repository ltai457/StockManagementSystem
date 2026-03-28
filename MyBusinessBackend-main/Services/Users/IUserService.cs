using RadiatorStockAPI.Models;

namespace RadiatorStockAPI.Services.Users;

public interface IUserService
{
    Task<List<User>> GetAllAsync();
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> CreateAsync(string username, string email, string password, UserRole role, string? firstName = null, string? lastName = null);
    Task<User?> UpdateAsync(Guid id, string username, string email, UserRole role, bool isActive, string? firstName = null, string? lastName = null);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
    Task<bool> UsernameExistsAsync(string username, Guid? excludeId = null);
    Task<bool> EmailExistsAsync(string email, Guid? excludeId = null);
}
