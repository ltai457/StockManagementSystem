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
        public DbSet<ProductType> ProductTypes { get; set; }
        public DbSet<Brand> Brands { get; set; }
        public DbSet<StockLevel> StockLevels { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
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
                entity.Property(r => r.Model).IsRequired().HasMaxLength(200);
                entity.Property(r => r.Type).HasMaxLength(50);

                // DateTime fields - use timestamp with time zone for UTC
                entity.Property(r => r.CreatedAt).IsRequired();
                entity.Property(r => r.UpdatedAt).IsRequired();

                // Optional fields
                entity.Property(r => r.CoreDimension).HasMaxLength(200);
                entity.Property(r => r.Dimension).HasMaxLength(200);
                entity.Property(r => r.ImageUrl).HasMaxLength(500);
                entity.Property(r => r.Notes).HasMaxLength(500);
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

            modelBuilder.Entity<ProductType>(entity =>
            {
                entity.HasKey(pt => pt.Id);
                entity.HasIndex(pt => pt.Name).IsUnique();
                entity.Property(pt => pt.Name).IsRequired().HasMaxLength(50);
            });

            modelBuilder.Entity<Brand>(entity =>
            {
                entity.HasKey(b => b.Id);
                entity.HasIndex(b => b.Name).IsUnique();
                entity.Property(b => b.Name).IsRequired().HasMaxLength(100);
            });

            // Configure StockLevel
            modelBuilder.Entity<StockLevel>(entity =>
            {
                entity.HasKey(s => s.Id);
                entity.HasIndex(s => new { s.RadiatorId, s.WarehouseId }).IsUnique();
                entity.Property(s => s.Version).IsRowVersion();

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

                entity.HasIndex(e => e.RadiatorId);
                entity.HasIndex(e => e.WarehouseId);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.MovementType);
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

            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}
