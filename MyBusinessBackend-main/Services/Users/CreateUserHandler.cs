using RadiatorStockAPI.DTOs.Users;
using RadiatorStockAPI.DTOs.Common;

namespace RadiatorStockAPI.Services.Users;

public interface ICreateUserHandler
{
    Task<Result<UserDto>> CreateAsync(CreateUserDto dto);
}

public class CreateUserHandler : ICreateUserHandler
{
    private readonly IUserService _service;
    public CreateUserHandler(IUserService service) => _service = service;

    public async Task<Result<UserDto>> CreateAsync(CreateUserDto dto)
    {
        if (await _service.UsernameExistsAsync(dto.Username))
        {
            return Result<UserDto>.Conflict($"Username '{dto.Username}' exists.");
        }
        if (await _service.EmailExistsAsync(dto.Email))
        {
            return Result<UserDto>.Conflict($"Email '{dto.Email}' exists.");
        }
        var u = await _service.CreateAsync(dto.Username, dto.Email, dto.Password, dto.Role, dto.FirstName, dto.LastName);
        if (u is null)
        {
            return Result<UserDto>.Fail("Failed to create user.");
        }
        return Result<UserDto>.Created(UserMapper.ToDto(u), "GetById", new { id = u.Id });
    }
}
