namespace RadiatorStockAPI.DTOs.Common;

public enum ResultStatus
{
    Ok,
    Created,
    NoContent,
    BadRequest,
    Unauthorized,
    NotFound,
    Conflict
}

public class Result<T>
{
    public ResultStatus Status { get; init; }
    public T? Data { get; init; }
    public string? Message { get; init; }
    public string? ActionName { get; init; }
    public object? RouteValues { get; init; }

    public static Result<T> Ok(T data) => new() { Status = ResultStatus.Ok, Data = data };
    public static Result<T> Created(T data, string action, object route) => new() { Status = ResultStatus.Created, Data = data, ActionName = action, RouteValues = route };
    public static Result<T> Deleted() => new() { Status = ResultStatus.NoContent };
    public static Result<T> Fail(string message) => new() { Status = ResultStatus.BadRequest, Message = message };
    public static Result<T> Unauthorized(string message) => new() { Status = ResultStatus.Unauthorized, Message = message };
    public static Result<T> NotFound(string message) => new() { Status = ResultStatus.NotFound, Message = message };
    public static Result<T> Conflict(string message) => new() { Status = ResultStatus.Conflict, Message = message };
}
