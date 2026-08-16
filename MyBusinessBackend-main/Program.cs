using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.FileProviders;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json;
using System.Threading.RateLimiting;
using Npgsql;
using RadiatorStockAPI.Data;
using RadiatorStockAPI.Middleware;
using RadiatorStockAPI.Services.Auth;
using RadiatorStockAPI.Services.Brands;
using RadiatorStockAPI.Services.ProductTypes;
using RadiatorStockAPI.Services.Radiators;
using RadiatorStockAPI.Services.Stock;
using RadiatorStockAPI.Services.Users;
using RadiatorStockAPI.Services.Warehouses;


// Load .env file
DotNetEnv.Env.Load();
var builder = WebApplication.CreateBuilder(args);

// Build connection string with support for environment variables and RDS
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Support for environment variables (better for production/containerization)
if (string.IsNullOrEmpty(connectionString))
{
    var host = Environment.GetEnvironmentVariable("DB_HOST");
    var database = Environment.GetEnvironmentVariable("DB_NAME");
    var username = Environment.GetEnvironmentVariable("DB_USERNAME");
    var password = Environment.GetEnvironmentVariable("DB_PASSWORD");
    var port = Environment.GetEnvironmentVariable("DB_PORT") ?? "5432";

    if (!builder.Environment.IsDevelopment()
        && new[] { host, database, username, password }.Any(string.IsNullOrWhiteSpace))
    {
        throw new InvalidOperationException(
            "Production database configuration is incomplete. Configure ConnectionStrings__DefaultConnection " +
            "or DB_HOST, DB_NAME, DB_USERNAME, and DB_PASSWORD.");
    }

    if (!int.TryParse(port, out var databasePort))
        throw new InvalidOperationException("DB_PORT must be a valid integer.");

    connectionString = new NpgsqlConnectionStringBuilder
    {
        Host = host ?? "localhost",
        Database = database ?? "radiatorstockdb",
        Username = username ?? "postgres",
        Password = password ?? string.Empty,
        Port = databasePort,
        SslMode = builder.Environment.IsDevelopment() ? SslMode.Disable : SslMode.Require
    }.ConnectionString;
}

// Add services to the container
builder.Services.AddDbContext<RadiatorDbContext>(options =>
{
    options.UseNpgsql(connectionString)
           .UseSnakeCaseNamingConvention(); // Use snake_case for PostgreSQL
});

// Register DAL layer
builder.Services.AddScoped<IWarehouseDal, WarehouseDal>();
builder.Services.AddScoped<IStockDal, StockDal>();
builder.Services.AddScoped<IRadiatorDal, RadiatorDal>();
builder.Services.AddScoped<IUserDal, UserDal>();
builder.Services.AddScoped<IAuthDal, AuthDal>();

// Register Service layer
builder.Services.AddScoped<IWarehouseService, WarehouseService>();
builder.Services.AddScoped<IStockService, StockService>();
builder.Services.AddScoped<IRadiatorService, RadiatorService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// Register Handler layer — Radiators
builder.Services.AddScoped<IGetRadiatorHandler, GetRadiatorHandler>();
builder.Services.AddScoped<ICreateRadiatorHandler, CreateRadiatorHandler>();
builder.Services.AddScoped<IUpdateRadiatorHandler, UpdateRadiatorHandler>();

// Register Handler layer — Warehouses
builder.Services.AddScoped<IGetWarehouseHandler, GetWarehouseHandler>();
builder.Services.AddScoped<ICreateWarehouseHandler, CreateWarehouseHandler>();
builder.Services.AddScoped<IUpdateWarehouseHandler, UpdateWarehouseHandler>();

// Register Handler layer — Users
builder.Services.AddScoped<IGetUserHandler, GetUserHandler>();
builder.Services.AddScoped<ICreateUserHandler, CreateUserHandler>();
builder.Services.AddScoped<IUpdateUserHandler, UpdateUserHandler>();

// Register Handler layer — Stock
builder.Services.AddScoped<IGetStockHandler, GetStockHandler>();
builder.Services.AddScoped<IUpdateStockHandler, UpdateStockHandler>();

// Register Handler layer — Product Types
builder.Services.AddScoped<IGetProductTypeHandler, GetProductTypeHandler>();
builder.Services.AddScoped<ICreateProductTypeHandler, CreateProductTypeHandler>();
builder.Services.AddScoped<IUpdateProductTypeHandler, UpdateProductTypeHandler>();

// Register Handler layer — Brands
builder.Services.AddScoped<IGetBrandHandler, GetBrandHandler>();
builder.Services.AddScoped<ICreateBrandHandler, CreateBrandHandler>();
builder.Services.AddScoped<IUpdateBrandHandler, UpdateBrandHandler>();

// Register Handler layer — Auth
builder.Services.AddScoped<IAuthHandler, AuthHandler>();

// Add health checks for monitoring
builder.Services.AddHealthChecks()
    .AddDbContextCheck<RadiatorDbContext>("database", tags: new[] { "ready" })
    .AddCheck("api", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy(), tags: new[] { "live", "ready" });

var allowedOrigins = (Environment.GetEnvironmentVariable("ALLOWED_ORIGINS") ?? string.Empty)
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray();

if (!builder.Environment.IsDevelopment() && allowedOrigins.Length == 0)
{
    throw new InvalidOperationException("ALLOWED_ORIGINS must contain at least one frontend origin in production.");
}

// Add CORS with enhanced configuration for network access
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // In development, allow any origin for easier testing
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        }
        else
        {
            // In production, use specific origins
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        }
    });
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("auth", httpContext => RateLimitPartition.GetFixedWindowLimiter(
        partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        factory: _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 10,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0,
            AutoReplenishment = true
        }));
});

// Add authentication
var jwtSettings = builder.Configuration.GetSection("JWT");
var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET") ?? jwtSettings["Secret"];
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? jwtSettings["Issuer"];
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? jwtSettings["Audience"];

if (string.IsNullOrWhiteSpace(secretKey) || Encoding.UTF8.GetByteCount(secretKey) < 32)
{
    throw new InvalidOperationException("JWT secret must be configured and contain at least 32 bytes.");
}

if (string.IsNullOrWhiteSpace(jwtIssuer) || string.IsNullOrWhiteSpace(jwtAudience))
    throw new InvalidOperationException("JWT issuer and audience must be configured.");

builder.Configuration["JWT:Secret"] = secretKey;
builder.Configuration["JWT:Issuer"] = jwtIssuer;
builder.Configuration["JWT:Audience"] = jwtAudience;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// Add controllers and API explorer with JSON options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = true;
    });
builder.Services.AddEndpointsApiExplorer();

// Add Swagger with JWT support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "RadiatorStock API", 
        Version = "v1",
        Description = "API for managing radiator inventory and stock"
    });
    
    // Add JWT authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Honor X-Forwarded-* headers from the reverse proxy (nginx / DO load balancer)
// so Request.Scheme/Host reflect the public URL instead of the internal http hop.
// Must run before any middleware that reads scheme/host (UseStaticFiles, controllers, etc.).
var forwardedHeadersOptions = new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor
                     | ForwardedHeaders.XForwardedProto
                     | ForwardedHeaders.XForwardedHost
};
forwardedHeadersOptions.KnownNetworks.Clear();
forwardedHeadersOptions.KnownProxies.Clear();
app.UseForwardedHeaders(forwardedHeadersOptions);

app.UseMiddleware<ApiExceptionMiddleware>();

var uploadRootPath =
    Environment.GetEnvironmentVariable("UPLOADS_ROOT_PATH")
    ?? builder.Configuration["Uploads:RootPath"]
    ?? Path.Combine(app.Environment.ContentRootPath, "wwwroot", "uploads");

var uploadRequestPath =
    Environment.GetEnvironmentVariable("UPLOADS_REQUEST_PATH")
    ?? builder.Configuration["Uploads:RequestPath"]
    ?? "/uploads";

if (!Path.IsPathRooted(uploadRootPath))
{
    uploadRootPath = Path.GetFullPath(Path.Combine(app.Environment.ContentRootPath, uploadRootPath));
}

Directory.CreateDirectory(Path.Combine(uploadRootPath, "radiators"));

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "RadiatorStock API v1");
        c.RoutePrefix = "swagger";
    });
}
else
{
    app.UseHsts();
    app.UseHttpsRedirection();
}

// Security headers
app.UseSecurityHeaders();

app.UseStaticFiles();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadRootPath),
    RequestPath = uploadRequestPath
});

// Enable CORS before authentication - THIS IS CRITICAL
app.UseCors("AllowFrontend");
app.UseRateLimiter();

// Authentication and authorization
app.UseAuthentication();
app.UseAuthorization();

// Map controllers
app.MapControllers();

static Task WriteHealthResponse(HttpContext context, Microsoft.Extensions.Diagnostics.HealthChecks.HealthReport report)
{
    context.Response.ContentType = "application/json";
    return context.Response.WriteAsync(JsonSerializer.Serialize(new
    {
        status = report.Status.ToString().ToLowerInvariant(),
        checks = report.Entries.Select(entry => new
        {
            name = entry.Key,
            status = entry.Value.Status.ToString().ToLowerInvariant()
        })
    }));
}

app.MapHealthChecks("/health", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
    ResponseWriter = WriteHealthResponse
}).AllowAnonymous();

app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("live"),
    ResponseWriter = WriteHealthResponse
}).AllowAnonymous();

// Add simple ping endpoint for load balancers
app.MapGet("/ping", () => Results.Ok(new { status = "ok" })).AllowAnonymous();

// Add API info endpoint
app.MapGet("/api/v1/info", (IWebHostEnvironment env) => Results.Ok(new {
    name = "RadiatorStock API",
    version = "1.0.0",
    endpoints = new {
        health = "/health",
        swagger = env.IsDevelopment() ? "/swagger" : null,
        auth = "/api/v1/auth",
        radiators = "/api/v1/radiators",
        warehouses = "/api/v1/warehouses",
        stock = "/api/v1/stock"
    }
})).AllowAnonymous();

// Database migration and seeding with enhanced error handling
try
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<RadiatorDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    var env = scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>();
    
    logger.LogInformation("Starting database migration and seeding...");
    
    // Test connection first
    var canConnect = await context.Database.CanConnectAsync();
    if (!canConnect)
    {
        throw new InvalidOperationException("Cannot connect to database");
    }
    
    // Apply pending migrations
    var pendingMigrations = await context.Database.GetPendingMigrationsAsync();
    var runMigrationsOnStartup = env.IsDevelopment()
        || Environment.GetEnvironmentVariable("RUN_MIGRATIONS_ON_STARTUP")?.Equals("true", StringComparison.OrdinalIgnoreCase) == true
        || builder.Configuration.GetValue<bool>("Database:RunMigrationsOnStartup");

    if (pendingMigrations.Any() && runMigrationsOnStartup)
    {
        logger.LogInformation("Applying {Count} pending migrations...", pendingMigrations.Count());
        await context.Database.MigrateAsync();
        logger.LogInformation("✅ Database migrations applied successfully");
    }
    else if (pendingMigrations.Any())
    {
        throw new InvalidOperationException(
            $"The database has {pendingMigrations.Count()} pending migration(s). " +
            "Apply them as a deployment step before starting the production API.");
    }
    else
    {
        logger.LogInformation("✅ Database is up to date, no migrations needed");
    }
    
    var seedDefaultUsers =
        env.IsDevelopment()
        && (Environment.GetEnvironmentVariable("SEED_DEFAULT_USERS")?.Equals("true", StringComparison.OrdinalIgnoreCase) == true
            || builder.Configuration.GetValue<bool>("Seeding:DefaultUsers"));

    var seedDemoRadiators =
        env.IsDevelopment()
        && (Environment.GetEnvironmentVariable("SEED_DEMO_RADIATORS")?.Equals("true", StringComparison.OrdinalIgnoreCase) == true
            || builder.Configuration.GetValue<bool>("Seeding:DemoRadiators"));

    // Seed initial data
    await SeedData.Initialize(context, seedDefaultUsers, seedDemoRadiators);

    var bootstrapAdminUsername = Environment.GetEnvironmentVariable("BOOTSTRAP_ADMIN_USERNAME");
    var bootstrapAdminEmail = Environment.GetEnvironmentVariable("BOOTSTRAP_ADMIN_EMAIL");
    var bootstrapAdminPassword = Environment.GetEnvironmentVariable("BOOTSTRAP_ADMIN_PASSWORD");
    var bootstrapValues = new[] { bootstrapAdminUsername, bootstrapAdminEmail, bootstrapAdminPassword };

    if (bootstrapValues.Any(value => !string.IsNullOrWhiteSpace(value)))
    {
        if (bootstrapValues.Any(string.IsNullOrWhiteSpace))
            throw new InvalidOperationException("All BOOTSTRAP_ADMIN_* variables must be provided together.");

        if (bootstrapAdminPassword!.Length < 12)
            throw new InvalidOperationException("BOOTSTRAP_ADMIN_PASSWORD must contain at least 12 characters.");

        await SeedData.BootstrapAdminAsync(
            context,
            bootstrapAdminUsername!,
            bootstrapAdminEmail!,
            bootstrapAdminPassword);
    }
    logger.LogInformation("✅ Database seeding completed successfully");
    
    // Log connection info (without sensitive details)
    var connectionInfo = context.Database.GetConnectionString();
    var maskedConnection = connectionInfo?.Split(';')
        .Where(part => !part.ToLower().Contains("password"))
        .Aggregate((a, b) => $"{a};{b}") ?? "Not available";
    
    logger.LogInformation("✅ Connected to database: {ConnectionInfo}", maskedConnection);
    
    Console.WriteLine("🚀 RadiatorStock API started successfully!");
    Console.WriteLine($"📊 Environment: {env.EnvironmentName}");
    Console.WriteLine($"🌐 CORS Policy: {(env.IsDevelopment() ? "Allow Any Origin (Development)" : "Restricted (Production)")}");
    Console.WriteLine($"🔗 API Documentation: {(env.IsDevelopment() ? "http://localhost:5128" : "")}/swagger");
    Console.WriteLine($"💚 Health Check: /health");
    Console.WriteLine($"📍 API Info: /api/v1/info");
    Console.WriteLine($"🏓 Ping: /ping");
    
    // Show network information
    Console.WriteLine("🌍 Network Access:");
    Console.WriteLine($"   - Localhost: http://localhost:5128");
    Console.WriteLine($"   - Network: http://{Environment.MachineName}:5128");
    Console.WriteLine($"   - IP Access: http://[your-ip]:5128");
}
catch (Exception ex)
{
    var logger = app.Services.GetService<ILogger<Program>>();
    logger?.LogCritical(ex, "❌ Failed to initialize database");
    Console.WriteLine($"❌ Database initialization failed: {ex.Message}");
    
    // In production, you might want to exit gracefully instead of throwing
    if (app.Environment.IsDevelopment())
    {
        Console.WriteLine("⚠️ Development mode: API will start anyway for debugging");
        Console.WriteLine("🔍 Check your database connection string and ensure PostgreSQL is running");
        Console.WriteLine("🌐 CORS is configured to allow any origin in development");
    }
    else
    {
        throw;
    }
}

app.Run();

// Extension method for security headers
public static class SecurityHeadersExtensions
{
    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
    {
        return app.Use(async (context, next) =>
        {
            context.Response.Headers["X-Content-Type-Options"] = "nosniff";
            context.Response.Headers["X-Frame-Options"] = "DENY";
            context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
            context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
            
            await next();
        });
    }
}
