using System.Net;
using Microsoft.AspNetCore.Mvc;
using RadiatorStockAPI.Services.Stock;

namespace RadiatorStockAPI.Middleware;

public sealed class ApiExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ApiExceptionMiddleware> _logger;

    public ApiExceptionMiddleware(RequestDelegate next, ILogger<ApiExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (StockConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Concurrent stock update rejected for {Path}", context.Request.Path);
            await WriteProblemAsync(
                context,
                HttpStatusCode.Conflict,
                "Stock was updated by another request",
                ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception for {Method} {Path}", context.Request.Method, context.Request.Path);
            await WriteProblemAsync(
                context,
                HttpStatusCode.InternalServerError,
                "An unexpected error occurred",
                "The request could not be completed.");
        }
    }

    private static async Task WriteProblemAsync(
        HttpContext context,
        HttpStatusCode statusCode,
        string title,
        string detail)
    {
        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/problem+json";

        await context.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = (int)statusCode,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path
        });
    }
}
