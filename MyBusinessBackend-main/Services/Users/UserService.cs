using RadiatorStockAPI.Models;

namespace RadiatorStockAPI.Services.Users;

public class UserService : IUserService
{
    private readonly IUserDal _dal;

    public UserService(IUserDal dal)
    {
        _dal = dal;
    }

    public Task<List<User>> GetAllAsync() => _dal.GetAllAsync();

    public Task<User?> GetByIdAsync(Guid id) => _dal.GetByIdAsync(id);

    public async Task<User?> CreateAsync(string username, string email, string password, UserRole role, string? firstName = null, string? lastName = null)
    {
        if (await _dal.UsernameExistsAsync(username) || await _dal.EmailExistsAsync(email))
            return null;

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = username,
            Email = email,
            FirstName = firstName,
            LastName = lastName,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = role,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _dal.AddAsync(user);
        return user;
    }

    public async Task<User?> UpdateAsync(Guid id, string username, string email, UserRole role, bool isActive, string? firstName = null, string? lastName = null)
    {
        var user = await _dal.GetByIdAsync(id);
        if (user is null) return null;

        if (await _dal.UsernameExistsAsync(username, id) || await _dal.EmailExistsAsync(email, id))
            return null;

        user.Username = username;
        user.Email = email;
        user.FirstName = firstName;
        user.LastName = lastName;
        user.Role = role;
        user.IsActive = isActive;
        user.UpdatedAt = DateTime.UtcNow;

        await _dal.SaveChangesAsync();
        return user;
    }

    public Task<bool> DeleteAsync(Guid id) => _dal.RemoveAsync(id);
    public Task<bool> ExistsAsync(Guid id) => _dal.ExistsAsync(id);
    public Task<bool> UsernameExistsAsync(string username, Guid? excludeId = null) => _dal.UsernameExistsAsync(username, excludeId);
    public Task<bool> EmailExistsAsync(string email, Guid? excludeId = null) => _dal.EmailExistsAsync(email, excludeId);
}
