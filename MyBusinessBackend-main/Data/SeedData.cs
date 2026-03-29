// Data/SeedData.cs
using Microsoft.EntityFrameworkCore;
using RadiatorStockAPI.Models;
using RadiatorStockAPI.Services.Stock;

namespace RadiatorStockAPI.Data
{
    public static class SeedData
    {
        private static readonly string[] LegacyWarehouseCodes = ["WH_AKL", "WH_CHC", "WH_WLG"];
        private static readonly (string Brand, string Model, int Year, string Dimensions)[] DemoRadiatorTemplates =
        [
            ("Denso", "Corolla Core", 2018, "680x408x16"),
            ("Koyo", "Hilux Heavy Duty", 2020, "725x448x26"),
            ("Nissens", "Civic Compact", 2017, "650x400x16"),
            ("Valeo", "Ranger Turbo", 2021, "710x440x26"),
            ("Toyo", "Swift Urban", 2019, "620x378x16"),
            ("CSF", "Navara MaxFlow", 2022, "740x460x26"),
            ("Mishimoto", "Accord Performance", 2016, "690x430x26"),
            ("Denso", "Prius Hybrid", 2015, "640x390x16"),
            ("Koyo", "BT-50 Utility", 2023, "735x452x26"),
            ("Nissens", "Outlander Family", 2018, "700x435x26"),
            ("Valeo", "RAV4 Touring", 2020, "705x430x26"),
            ("Toyo", "Yaris Compact", 2017, "610x365x16"),
            ("CSF", "Land Cruiser HD", 2019, "780x498x32"),
            ("Mishimoto", "WRX Street", 2021, "670x415x26"),
            ("Denso", "Mazda 3 Daily", 2016, "655x402x16"),
            ("Koyo", "CR-V Touring", 2022, "710x442x26"),
            ("Nissens", "Lancer Evo", 2014, "665x405x26"),
            ("Valeo", "Santa Fe SUV", 2021, "720x450x26"),
            ("Toyo", "Focus Hatch", 2018, "645x395x16"),
            ("CSF", "Hiace Van", 2020, "760x470x26"),
            ("Mishimoto", "Amarok V6", 2023, "748x458x32"),
            ("Denso", "Elantra Comfort", 2019, "650x400x16"),
            ("Koyo", "Pajero Sport", 2017, "730x455x26"),
            ("Nissens", "Astra City", 2015, "635x388x16"),
            ("Valeo", "Triton Workmate", 2024, "742x460x26"),
        ];

        public static async Task Initialize(RadiatorDbContext context)
        {
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
                    Name = $"{item.template.Model} Radiator",
                    Year = item.template.Year,
                    RetailPrice = 0,
                    TradePrice = null,
                    CostPrice = null,
                    IsPriceOverridable = false,
                    MaxDiscountPercent = null,
                    Dimensions = item.template.Dimensions,
                    Notes = $"Demo product {item.index} for UI and stock testing.",
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
