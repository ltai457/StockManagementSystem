using RadiatorStockAPI.DTOs.Users;
using RadiatorStockAPI.DTOs.Common;

namespace RadiatorStockAPI.Services.Users;

public interface IGetUserHandler
{
    Task<Result<List<UserDto>>> GetAllAsync();
    Task<Result<UserDto>> GetByIdAsync(Guid id);
    Task<Result<object>> CheckUsernameAsync(string username);
    Task<Result<object>> CheckEmailAsync(string email);
}

public class GetUserHandler : IGetUserHandler
{
    private readonly IUserService _service;
    public GetUserHandler(IUserService service) => _service = service;

    public async Task<Result<List<UserDto>>> GetAllAsync()
        => Result<List<UserDto>>.Ok((await _service.GetAllAsync()).Select(UserMapper.ToDto).ToList());

    public async Task<Result<UserDto>> GetByIdAsync(Guid id)
    {
        var u = await _service.GetByIdAsync(id);
        if (u is null)
        {
            return Result<UserDto>.NotFound($"User {id} not found.");
        }
        return Result<UserDto>.Ok(UserMapper.ToDto(u));
    }

    public async Task<Result<object>> CheckUsernameAsync(string username)
        => Result<object>.Ok(new { exists = await _service.UsernameExistsAsync(username) });

    public async Task<Result<object>> CheckEmailAsync(string email)
        => Result<object>.Ok(new { exists = await _service.EmailExistsAsync(email) });
}
