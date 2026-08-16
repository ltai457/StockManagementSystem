using System.ComponentModel.DataAnnotations;

namespace RadiatorStockAPI.Models
{
    public class StockLevel
    {
        public Guid Id { get; set; }
        
        [Required]
        public Guid RadiatorId { get; set; }
        
        [Required]
        public Guid WarehouseId { get; set; }
        
        [Range(0, int.MaxValue)]
        public int Quantity { get; set; } = 0;

        // PostgreSQL xmin optimistic concurrency token. Concurrent stock writes
        // are rejected instead of silently overwriting each other.
        public uint Version { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual Radiator Radiator { get; set; } = null!;
        public virtual Warehouse Warehouse { get; set; } = null!;
    }
}
