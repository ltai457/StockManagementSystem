using RadiatorStockAPI.Models;

namespace RadiatorStockAPI.Services.Users;

public interface IUserDal
{
    Task<List<User>> GetAllAsync();
    Task<User?> GetByIdAsync(Guid id);
    Task AddAsync(User user);
    Task<bool> RemoveAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
    Task<bool> UsernameExistsAsync(string username, Guid? excludeId = null);
    Task<bool> EmailExistsAsync(string email, Guid? excludeId = null);
    Task SaveChangesAsync();
}
