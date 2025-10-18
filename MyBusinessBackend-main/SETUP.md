# Setup Instructions

## IMPORTANT: Security Configuration Required

This project requires sensitive configuration data that is NOT included in the repository for security reasons.

## Quick Setup

### Option 1: Using appsettings.Development.json (Recommended for Development)

1. Create a file named `appsettings.Development.json` in the project root directory
2. Copy the following template and fill in your actual values:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=YOUR_DB_HOST;Database=YOUR_DB_NAME;Username=YOUR_DB_USERNAME;Password=YOUR_DB_PASSWORD;Port=5432;SSL Mode=Require"
  },
  "JWT": {
    "Secret": "YOUR_JWT_SECRET_AT_LEAST_32_CHARACTERS_LONG",
    "Issuer": "RadiatorStockAPI",
    "Audience": "RadiatorStockAPI-Users",
    "AccessTokenExpirationMinutes": 15,
    "RefreshTokenExpirationDays": 7
  },
  "AWS": {
    "Profile": "default",
    "Region": "us-east-2",
    "S3": {
      "BucketName": "YOUR_S3_BUCKET_NAME"
    }
  }
}
```

### Option 2: Using Environment Variables

Alternatively, you can use environment variables. See `.env.example` for the required variables.

## Configuration Values You Need

### 1. Database Connection String
- **DB_HOST**: Your PostgreSQL database host (e.g., RDS endpoint)
- **DB_NAME**: Your database name
- **DB_USERNAME**: Database username
- **DB_PASSWORD**: Database password
- **DB_PORT**: Database port (usually 5432)

### 2. JWT Secret
- Generate a secure random string at least 32 characters long
- You can generate one using: `openssl rand -base64 32`

### 3. AWS Configuration
- **AWS_REGION**: Your AWS region (e.g., us-east-2)
- **AWS_S3_BUCKET_NAME**: Your S3 bucket name for storing images
- Ensure your AWS credentials are configured (via AWS CLI or environment)

## Security Best Practices

### Before Deploying:

1. **Change ALL passwords and secrets from your development environment**
2. **Never commit `appsettings.Local.json` or `.env` files**
3. **Use different credentials for development, staging, and production**
4. **Rotate your JWT secret periodically**
5. **Use AWS IAM roles with minimal required permissions**

### For Production:

- Use environment variables or secure secret management services (AWS Secrets Manager, Azure Key Vault, etc.)
- Enable SSL/TLS for all database connections
- Use managed identity/IAM roles instead of hardcoded AWS credentials
- Enable database connection pooling and connection encryption

## Verifying Your Setup

Run the application:
```bash
dotnet run
```

If configured correctly, you should see the application start without errors.

## Troubleshooting

- **Connection string errors**: Verify your database is accessible and credentials are correct
- **JWT errors**: Ensure your secret is at least 32 characters long
- **AWS errors**: Check that your AWS credentials are properly configured and have permissions for S3

## NEVER Commit These Files:
- `appsettings.Development.json`
- `appsettings.Production.json`
- `.env`
- Any file containing real passwords or API keys
