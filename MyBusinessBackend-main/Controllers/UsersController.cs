using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RadiatorStockAPI.DTOs.Users;
using RadiatorStockAPI.Services.Users;

namespace RadiatorStockAPI.Controllers;

[Route("api/v1/users"), Authorize(Roles = "Admin")]
public class UsersController : BaseController
{
    private readonly IGetUserHandler _get;
    private readonly ICreateUserHandler _create;
    private readonly IUpdateUserHandler _update;

    public UsersController(IGetUserHandler get, ICreateUserHandler create, IUpdateUserHandler update)
    {
        _get = get;
        _create = create;
        _update = update;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Run(await _get.GetAllAsync());

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id) => Run(await _get.GetByIdAsync(id));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserDto dto) => Run(await _create.CreateAsync(dto));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserDto dto) => Run(await _update.UpdateAsync(id, dto));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id) => Run(await _update.DeleteAsync(id));

    [HttpGet("check-username/{username}")]
    public async Task<IActionResult> CheckUsername(string username) => Run(await _get.CheckUsernameAsync(username));

    [HttpGet("check-email/{email}")]
    public async Task<IActionResult> CheckEmail(string email) => Run(await _get.CheckEmailAsync(email));
}
