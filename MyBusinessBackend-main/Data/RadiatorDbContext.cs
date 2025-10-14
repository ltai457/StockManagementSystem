// Data/RadiatorDbContext.cs
using Microsoft.EntityFrameworkCore;
using RadiatorStockAPI.Models;

namespace RadiatorStockAPI.Data
{
    public class RadiatorDbContext : DbContext
    {
        public RadiatorDbContext(DbContextOptions<RadiatorDbContext> options) : base(options)
        {
        }

        public DbSet<Radiator> Radiators { get; set; }
        public DbSet<Warehouse> Warehouses { get; set; }
        public DbSet<StockLevel> StockLevels { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Sale> Sales { get; set; }
        public DbSet<SaleItem> SaleItems { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoiceItem> InvoiceItems { get; set; }

        public DbSet<RadiatorImage> RadiatorImages { get; set; }

        public DbSet<StockHistory> StockHistories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Radiator
            modelBuilder.Entity<Radiator>(entity =>
 {
     entity.HasKey(r => r.Id);
     entity.HasIndex(r => r.Code).IsUnique();
     entity.Property(r => r.Brand).IsRequired().HasMaxLength(100);
     entity.Property(r => r.Code).IsRequired().HasMaxLength(50);
     entity.Property(r => r.Name).IsRequired().HasMaxLength(200);

     // ===== ADD THESE NEW LINES =====
     entity.Property(r => r.ProductType).HasMaxLength(100);
     entity.Property(r => r.Dimensions).HasMaxLength(200);
     entity.Property(r => r.Notes).HasMaxLength(500);
     // ===============================
 });

            // Configure Warehouse
            modelBuilder.Entity<Warehouse>(entity =>
            {
                entity.HasKey(w => w.Id);
                entity.HasIndex(w => w.Code).IsUnique();
                entity.Property(w => w.Code).IsRequired().HasMaxLength(10);
                entity.Property(w => w.Name).IsRequired().HasMaxLength(100);
                entity.Property(w => w.Address).HasMaxLength(500);
                entity.Property(w => w.Email).HasMaxLength(150);
                entity.Property(w => w.Phone).HasMaxLength(20);
                entity.Property(w => w.Location).HasMaxLength(200);
            });

            // Configure StockLevel
            modelBuilder.Entity<StockLevel>(entity =>
            {
                entity.HasKey(s => s.Id);
                entity.HasIndex(s => new { s.RadiatorId, s.WarehouseId }).IsUnique();

                entity.HasOne(s => s.Radiator)
                    .WithMany(r => r.StockLevels)
                    .HasForeignKey(s => s.RadiatorId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(s => s.Warehouse)
                    .WithMany(w => w.StockLevels)
                    .HasForeignKey(s => s.WarehouseId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure User
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);
                entity.HasIndex(u => u.Username).IsUnique();
                entity.HasIndex(u => u.Email).IsUnique();
                entity.Property(u => u.Username).IsRequired().HasMaxLength(50);
                entity.Property(u => u.Email).IsRequired().HasMaxLength(100);
                entity.Property(u => u.PasswordHash).IsRequired();
                entity.Property(u => u.Role).HasConversion<int>();
            });

            // Configure RefreshToken
            modelBuilder.Entity<RefreshToken>(entity =>
            {
                entity.HasKey(rt => rt.Id);
                entity.HasIndex(rt => rt.Token).IsUnique();
                entity.Property(rt => rt.Token).IsRequired();

                entity.HasOne(rt => rt.User)
                    .WithMany(u => u.RefreshTokens)
                    .HasForeignKey(rt => rt.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure Customer
            modelBuilder.Entity<Customer>(entity =>
            {
                entity.HasKey(c => c.Id);
                entity.Property(c => c.FirstName).IsRequired().HasMaxLength(100);
                entity.Property(c => c.LastName).IsRequired().HasMaxLength(100);
                entity.Property(c => c.Email).HasMaxLength(150);
                entity.Property(c => c.Phone).HasMaxLength(20);
                entity.Property(c => c.Company).HasMaxLength(200);
                entity.Property(c => c.Address).HasMaxLength(500);
                entity.HasIndex(c => c.Email);
                entity.HasIndex(c => c.Phone);
            });

            // Configure Sale
            modelBuilder.Entity<Sale>(entity =>
            {
                entity.HasKey(s => s.Id);
                entity.Property(s => s.SaleNumber).IsRequired().HasMaxLength(50);
                entity.Property(s => s.PaymentMethod).IsRequired().HasMaxLength(20);
                entity.Property(s => s.SubTotal).HasPrecision(18, 2);
                entity.Property(s => s.TaxAmount).HasPrecision(18, 2);
                entity.Property(s => s.TotalAmount).HasPrecision(18, 2);
                entity.Property(s => s.Notes).HasMaxLength(500);
                entity.Property(s => s.Status).HasConversion<int>();

                entity.HasIndex(s => s.SaleNumber).IsUnique();
                entity.HasIndex(s => s.SaleDate);

                entity.HasOne(s => s.Customer)
                    .WithMany(c => c.Sales)
                    .HasForeignKey(s => s.CustomerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(s => s.ProcessedBy)
                    .WithMany()
                    .HasForeignKey(s => s.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
            // Configure RadiatorImage - add this to your OnModelCreating method
            modelBuilder.Entity<RadiatorImage>(entity =>
            {
                entity.HasKey(img => img.Id);
                entity.Property(img => img.FileName).IsRequired().HasMaxLength(255);
                entity.Property(img => img.S3Key).IsRequired().HasMaxLength(500);
                entity.Property(img => img.Url).IsRequired().HasMaxLength(1000);

                entity.HasOne(img => img.Radiator)
                    .WithMany(r => r.Images)
                    .HasForeignKey(img => img.RadiatorId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure SaleItem
            modelBuilder.Entity<SaleItem>(entity =>
            {
                entity.HasKey(si => si.Id);
                entity.Property(si => si.UnitPrice).HasPrecision(18, 2);
                entity.Property(si => si.TotalPrice).HasPrecision(18, 2);

                entity.HasOne(si => si.Sale)
                    .WithMany(s => s.SaleItems)
                    .HasForeignKey(si => si.SaleId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(si => si.Radiator)
                    .WithMany()
                    .HasForeignKey(si => si.RadiatorId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(si => si.Warehouse)
                    .WithMany()
                    .HasForeignKey(si => si.WarehouseId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure StockHistory
            modelBuilder.Entity<StockHistory>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.MovementType).IsRequired().HasMaxLength(50);
                entity.Property(e => e.ChangeType).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Notes).HasMaxLength(500);
                entity.Property(e => e.CreatedAt).IsRequired();

                entity.HasOne(e => e.Radiator)
                    .WithMany()
                    .HasForeignKey(e => e.RadiatorId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Warehouse)
                    .WithMany()
                    .HasForeignKey(e => e.WarehouseId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Sale)
                    .WithMany()
                    .HasForeignKey(e => e.SaleId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(e => e.RadiatorId);
                entity.HasIndex(e => e.WarehouseId);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.MovementType);
            });

            // Configure Invoice
            modelBuilder.Entity<Invoice>(entity =>
            {
                entity.HasKey(i => i.Id);
                entity.Property(i => i.InvoiceNumber).IsRequired().HasMaxLength(50);
                entity.Property(i => i.CustomerFullName).IsRequired().HasMaxLength(150);
                entity.Property(i => i.CustomerEmail).HasMaxLength(150);
                entity.Property(i => i.CustomerPhone).HasMaxLength(30);
                entity.Property(i => i.CustomerCompany).HasMaxLength(200);
                entity.Property(i => i.CustomerAddress).HasMaxLength(300);
                entity.Property(i => i.SubTotal).HasPrecision(18, 2);
                entity.Property(i => i.TaxRate).HasPrecision(5, 4);
                entity.Property(i => i.TaxAmount).HasPrecision(18, 2);
                entity.Property(i => i.TotalAmount).HasPrecision(18, 2);
                entity.Property(i => i.PaymentMethod).IsRequired().HasMaxLength(20);
                entity.Property(i => i.Notes).HasMaxLength(500);
                entity.Property(i => i.Status).HasConversion<int>();

                entity.HasIndex(i => i.InvoiceNumber).IsUnique();
                entity.HasIndex(i => i.IssueDate);
                entity.HasIndex(i => i.Status);

                entity.HasOne(i => i.CreatedBy)
                    .WithMany()
                    .HasForeignKey(i => i.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure InvoiceItem
            modelBuilder.Entity<InvoiceItem>(entity =>
            {
                entity.HasKey(ii => ii.Id);
                entity.Property(ii => ii.Description).IsRequired().HasMaxLength(500);
                entity.Property(ii => ii.RadiatorCode).HasMaxLength(100);
                entity.Property(ii => ii.RadiatorName).HasMaxLength(200);
                entity.Property(ii => ii.Brand).HasMaxLength(100);
                entity.Property(ii => ii.WarehouseCode).HasMaxLength(50);
                entity.Property(ii => ii.WarehouseName).HasMaxLength(200);
                entity.Property(ii => ii.UnitPrice).HasPrecision(18, 2);
                entity.Property(ii => ii.TotalPrice).HasPrecision(18, 2);

                entity.HasOne(ii => ii.Invoice)
                    .WithMany(i => i.InvoiceItems)
                    .HasForeignKey(ii => ii.InvoiceId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ii => ii.Radiator)
                    .WithMany()
                    .HasForeignKey(ii => ii.RadiatorId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(ii => ii.Warehouse)
                    .WithMany()
                    .HasForeignKey(ii => ii.WarehouseId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var entries = ChangeTracker.Entries()
                .Where(e => e.Entity is Radiator && (e.State == EntityState.Added || e.State == EntityState.Modified));

            foreach (var entry in entries)
            {
                if (entry.Entity is Radiator radiator)
                {
                    if (entry.State == EntityState.Added)
                        radiator.CreatedAt = DateTime.UtcNow;
                    radiator.UpdatedAt = DateTime.UtcNow;
                }
            }

            var stockEntries = ChangeTracker.Entries()
                .Where(e => e.Entity is StockLevel && (e.State == EntityState.Added || e.State == EntityState.Modified));

            foreach (var entry in stockEntries)
            {
                if (entry.Entity is StockLevel stock)
                {
                    if (entry.State == EntityState.Added)
                        stock.CreatedAt = DateTime.UtcNow;
                    stock.UpdatedAt = DateTime.UtcNow;
                }
            }

            var userEntries = ChangeTracker.Entries()
                .Where(e => e.Entity is User && (e.State == EntityState.Added || e.State == EntityState.Modified));

            foreach (var entry in userEntries)
            {
                if (entry.Entity is User user)
                {
                    if (entry.State == EntityState.Added)
                        user.CreatedAt = DateTime.UtcNow;
                    user.UpdatedAt = DateTime.UtcNow;
                }
            }

            // Handle Customer timestamps
            var customerEntries = ChangeTracker.Entries()
                .Where(e => e.Entity is Customer && (e.State == EntityState.Added || e.State == EntityState.Modified));

            foreach (var entry in customerEntries)
            {
                if (entry.Entity is Customer customer)
                {
                    if (entry.State == EntityState.Added)
                        customer.CreatedAt = DateTime.UtcNow;
                    customer.UpdatedAt = DateTime.UtcNow;
                }
            }

            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}