using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.AspNetCore.Http;

namespace RadiatorStockAPI.Services.S3
{
    public class S3Service : IS3Service
    {
        private readonly IAmazonS3 _s3Client;
        private readonly IConfiguration _configuration;
        private readonly string _bucketName;

        public S3Service(IAmazonS3 s3Client, IConfiguration configuration)
        {
            _s3Client = s3Client;
            _configuration = configuration;
            _bucketName = _configuration["DigitalOcean:Spaces:BucketName"]
                ?? Environment.GetEnvironmentVariable("DO_SPACES_BUCKET_NAME")
                ?? throw new InvalidOperationException("Digital Ocean Spaces bucket name not configured");
        }

        public async Task<string> UploadImageAsync(IFormFile file)
        {
            var key = $"radiators/{Guid.NewGuid()}_{file.FileName}";

            using var stream = file.OpenReadStream();

            var request = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = key,
                InputStream = stream,
                ContentType = file.ContentType,
                CannedACL = S3CannedACL.PublicRead  // ✅ ADDED - Makes image publicly accessible
            };

            await _s3Client.PutObjectAsync(request);

            // Return Digital Ocean Spaces CDN URL (faster delivery)
            var region = _configuration["DigitalOcean:Spaces:Region"]
                ?? Environment.GetEnvironmentVariable("DO_SPACES_REGION")
                ?? "sgp1";
            var useCdn = _configuration.GetValue<bool>("DigitalOcean:Spaces:UseCDN", true);

            // Use CDN endpoint if enabled, otherwise use direct endpoint
            if (useCdn)
            {
                return $"https://{_bucketName}.{region}.cdn.digitaloceanspaces.com/{key}";
            }
            else
            {
                return $"https://{_bucketName}.{region}.digitaloceanspaces.com/{key}";
            }
        }

        public async Task<bool> DeleteImageAsync(string key)
        {
            try
            {
                await _s3Client.DeleteObjectAsync(_bucketName, key);
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
