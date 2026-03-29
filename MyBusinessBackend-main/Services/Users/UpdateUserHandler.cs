using RadiatorStockAPI.DTOs.Users;
using RadiatorStockAPI.DTOs.Common;

namespace RadiatorStockAPI.Services.Users;

public interface IUpdateUserHandler
{
    Task<Result<UserDto>> UpdateAsync(Guid id, UpdateUserDto dto);
    Task<Result<object>> DeleteAsync(Guid id);
}

public class UpdateUserHandler : IUpdateUserHandler
{
    private readonly IUserService _service;
    public UpdateUserHandler(IUserService service) => _service = service;

    public async Task<Result<UserDto>> UpdateAsync(Guid id, UpdateUserDto dto)
    {
        if (!await _service.ExistsAsync(id))
        {
            return Result<UserDto>.NotFound($"User {id} not found.");
        }
        var u = await _service.UpdateAsync(id, dto.Username, dto.Email, dto.Role, dto.IsActive, dto.FirstName, dto.LastName);
        if (u is null)
        {
            return Result<UserDto>.Conflict("Username or email conflict.");
        }
        return Result<UserDto>.Ok(UserMapper.ToDto(u));
    }

    public async Task<Result<object>> DeleteAsync(Guid id)
    {
        if (!await _service.ExistsAsync(id))
        {
            return Result<object>.NotFound($"User {id} not found.");
        }
        var success = await _service.DeleteAsync(id);
        if (success)
        {
            return Result<object>.Deleted();
        }
        return Result<object>.Fail("Failed to delete.");
    }
}
