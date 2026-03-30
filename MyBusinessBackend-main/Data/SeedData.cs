// Data/SeedData.cs
using Microsoft.EntityFrameworkCore;
using RadiatorStockAPI.Models;
using RadiatorStockAPI.Services.Stock;

namespace RadiatorStockAPI.Data
{
    public static class SeedData
    {
        private static readonly string[] LegacyWarehouseCodes = ["WH_AKL", "WH_CHC", "WH_WLG"];
        private static readonly string[] DefaultProductTypes =
        [
            "Passenger Car",
            "SUV / 4WD",
            "Ute / Pickup",
            "Van",
            "Performance"
        ];
        private static readonly (string Brand, string Model, string Type, string CoreDimension, string Dimension)[] DemoRadiatorTemplates =
        [
            ("Denso", "Corolla", "Passenger Car", "680x408x16", "710x440x40"),
            ("Koyo", "Hilux", "Ute / Pickup", "725x448x26", "755x480x50"),
            ("Nissens", "Civic", "Passenger Car", "650x400x16", "680x430x40"),
            ("Valeo", "Ranger", "Ute / Pickup", "710x440x26", "740x470x50"),
            ("Toyo", "Swift", "Passenger Car", "620x378x16", "650x410x40"),
            ("CSF", "Navara", "Ute / Pickup", "740x460x26", "770x490x50"),
            ("Mishimoto", "Accord", "Passenger Car", "690x430x26", "720x460x50"),
            ("Denso", "Prius", "Passenger Car", "640x390x16", "670x420x40"),
            ("Koyo", "BT-50", "Ute / Pickup", "735x452x26", "765x480x50"),
            ("Nissens", "Outlander", "SUV / 4WD", "700x435x26", "730x465x50"),
            ("Valeo", "RAV4", "SUV / 4WD", "705x430x26", "735x460x50"),
            ("Toyo", "Yaris", "Passenger Car", "610x365x16", "640x395x40"),
            ("CSF", "Land Cruiser", "SUV / 4WD", "780x498x32", "810x530x56"),
            ("Mishimoto", "WRX", "Performance", "670x415x26", "700x445x50"),
            ("Denso", "Mazda 3", "Passenger Car", "655x402x16", "685x432x40"),
            ("Koyo", "CR-V", "SUV / 4WD", "710x442x26", "740x472x50"),
            ("Nissens", "Lancer", "Passenger Car", "665x405x26", "695x435x50"),
            ("Valeo", "Santa Fe", "SUV / 4WD", "720x450x26", "750x480x50"),
            ("Toyo", "Focus", "Passenger Car", "645x395x16", "675x425x40"),
            ("CSF", "Hiace", "Van", "760x470x26", "790x500x50"),
            ("Mishimoto", "Amarok", "Ute / Pickup", "748x458x32", "778x488x56"),
            ("Denso", "Elantra", "Passenger Car", "650x400x16", "680x430x40"),
            ("Koyo", "Pajero", "SUV / 4WD", "730x455x26", "760x485x50"),
            ("Nissens", "Astra", "Passenger Car", "635x388x16", "665x418x40"),
            ("Valeo", "Triton", "Ute / Pickup", "742x460x26", "772x490x50"),
        ];

        public static async Task Initialize(RadiatorDbContext context)
        {
            await EnsureProductTypesTableAsync(context);
            await SeedProductTypesAsync(context);
            await CleanupLegacyWarehousesAsync(context);
            await SeedDemoRadiatorsAsync(context);

            // Seed Default Users
            if (!await context.Users.AnyAsync())
            {
                var users = new[]
                {
                    new User
                    {
                        Id = Guid.NewGuid(),
                        Username = "admin",
                        Email = "admin@radiatorstock.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                        Role = UserRole.Admin,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        Id = Guid.NewGuid(),
                        Username = "staff1",
                        Email = "staff1@radiatorstock.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Staff123!"),
                        Role = UserRole.Staff,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    }
                };
                
                context.Users.AddRange(users);
                await context.SaveChangesAsync();
                Console.WriteLine("✅ Default users seeded successfully");
                Console.WriteLine("   👑 Admin: username='admin', password='Admin123!'");
                Console.WriteLine("   👤 Staff: username='staff1', password='Staff123!'");
            }
        }

        private static async Task EnsureProductTypesTableAsync(RadiatorDbContext context)
        {
            await context.Database.ExecuteSqlRawAsync(@"
                CREATE TABLE IF NOT EXISTS product_types (
                    id uuid PRIMARY KEY,
                    name varchar(50) NOT NULL UNIQUE,
                    is_active boolean NOT NULL,
                    created_at timestamp with time zone NOT NULL,
                    updated_at timestamp with time zone NOT NULL
                );");
        }

        private static async Task SeedProductTypesAsync(RadiatorDbContext context)
        {
            var existingNames = (await context.ProductTypes
                .Select(pt => pt.Name)
                .ToListAsync())
                .Where(name => !string.IsNullOrWhiteSpace(name))
                .Select(name => name.Trim())
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            var candidateNames = DefaultProductTypes
                .Concat(DemoRadiatorTemplates.Select(t => t.Type))
                .Concat(await context.Radiators.Select(r => r.Type).ToListAsync())
                .Where(name => !string.IsNullOrWhiteSpace(name))
                .Select(name => name.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Where(name => !existingNames.Contains(name))
                .ToList();

            if (!candidateNames.Any())
            {
                return;
            }

            context.ProductTypes.AddRange(candidateNames.Select(name => new ProductType
            {
                Id = Guid.NewGuid(),
                Name = name,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }));

            await context.SaveChangesAsync();
        }

        private static async Task CleanupLegacyWarehousesAsync(RadiatorDbContext context)
        {
            var legacyWarehouses = await context.Warehouses
                .Where(w => LegacyWarehouseCodes.Contains(w.Code))
                .Select(w => new { w.Id, w.Code })
                .ToListAsync();

            if (!legacyWarehouses.Any())
            {
                return;
            }

            var legacyWarehouseIds = legacyWarehouses.Select(w => w.Id).ToList();

            var stockLevels = await context.StockLevels
                .Where(sl => legacyWarehouseIds.Contains(sl.WarehouseId))
                .ToListAsync();

            var stockHistories = await context.StockHistories
                .Where(sh => legacyWarehouseIds.Contains(sh.WarehouseId))
                .ToListAsync();

            if (stockHistories.Any())
            {
                context.StockHistories.RemoveRange(stockHistories);
            }

            if (stockLevels.Any())
            {
                context.StockLevels.RemoveRange(stockLevels);
            }

            var warehouses = await context.Warehouses
                .Where(w => legacyWarehouseIds.Contains(w.Id))
                .ToListAsync();

            context.Warehouses.RemoveRange(warehouses);
            await context.SaveChangesAsync();

            Console.WriteLine($"🧹 Removed legacy seeded warehouses: {string.Join(", ", legacyWarehouses.Select(w => w.Code))}");
        }

        private static async Task SeedDemoRadiatorsAsync(RadiatorDbContext context)
        {
            const string demoPrefix = "DEMO-";

            var existingDemoCodes = await context.Radiators
                .Where(r => r.Code.StartsWith(demoPrefix))
                .Select(r => r.Code)
                .ToListAsync();

            var warehouses = await context.Warehouses
                .OrderBy(w => w.Code)
                .ToListAsync();

            var demoRadiatorsToCreate = DemoRadiatorTemplates
                .Select((template, index) => new { template, index = index + 1 })
                .Where(x => !existingDemoCodes.Contains($"{demoPrefix}{x.index:000}"))
                .ToList();

            if (!demoRadiatorsToCreate.Any())
            {
                return;
            }

            var now = DateTime.UtcNow;

            foreach (var item in demoRadiatorsToCreate)
            {
                var code = $"{demoPrefix}{item.index:000}";
                var radiator = new Radiator
                {
                    Id = Guid.NewGuid(),
                    Brand = item.template.Brand,
                    Code = code,
                    Model = item.template.Model,
                    Type = item.template.Type,
                    RetailPrice = 0,
                    TradePrice = null,
                    CostPrice = null,
                    IsPriceOverridable = false,
                    MaxDiscountPercent = null,
                    CoreDimension = item.template.CoreDimension,
                    Dimension = item.template.Dimension,
                    ImageUrl = null,
                    Notes = $"Demo product {item.index} for UI testing. Core: {item.template.CoreDimension}, overall: {item.template.Dimension}.",
                    CreatedAt = now,
                    UpdatedAt = now,
                };

                context.Radiators.Add(radiator);

                foreach (var warehouse in warehouses)
                {
                    var quantity = GetDemoStockQuantity(item.index, warehouse.Code);
                    context.StockLevels.Add(new StockLevel
                    {
                        Id = Guid.NewGuid(),
                        RadiatorId = radiator.Id,
                        WarehouseId = warehouse.Id,
                        Quantity = quantity,
                        CreatedAt = now,
                        UpdatedAt = now,
                    });
                }
            }

            await context.SaveChangesAsync();
            Console.WriteLine($"🧪 Seeded {demoRadiatorsToCreate.Count} demo radiators");
        }

        private static int GetDemoStockQuantity(int itemIndex, string warehouseCode)
        {
            var warehouseSeed = Math.Abs(warehouseCode.GetHashCode());
            var pattern = (itemIndex + warehouseSeed) % 6;

            return pattern switch
            {
                0 => 0,
                1 => 3,
                2 => StockAlertSettings.LowStockThreshold,
                3 => StockAlertSettings.LowStockThreshold - 2,
                4 => 18,
                _ => 27,
            };
        }
    }
}
