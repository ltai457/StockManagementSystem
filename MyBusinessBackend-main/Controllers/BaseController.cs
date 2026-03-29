using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using RadiatorStockAPI.DTOs.Common;

namespace RadiatorStockAPI.Controllers;

[ApiController]
[Produces("application/json")]
public abstract class BaseController : ControllerBase
{
    protected Guid GetUserId()
    {
        Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var userId);
        return userId;
    }

    protected string? GetUsername() => User.FindFirst(ClaimTypes.Name)?.Value;
    protected string? GetEmail() => User.FindFirst(ClaimTypes.Email)?.Value;
    protected string? GetRole() => User.FindFirst(ClaimTypes.Role)?.Value;

    protected IActionResult Run<T>(Result<T> result) => result.Status switch
    {
        ResultStatus.Ok        => Ok(result.Data),
        ResultStatus.Created   => CreatedAtAction(result.ActionName, result.RouteValues, result.Data),
        ResultStatus.NoContent => NoContent(),
        ResultStatus.BadRequest   => BadRequest(new { message = result.Message }),
        ResultStatus.Unauthorized => Unauthorized(new { message = result.Message }),
        ResultStatus.NotFound     => NotFound(new { message = result.Message }),
        ResultStatus.Conflict     => Conflict(new { message = result.Message }),
        _ => StatusCode(500, new { message = "Unknown error" })
    };
}
