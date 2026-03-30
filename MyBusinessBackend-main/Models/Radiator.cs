using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RadiatorStockAPI.Models
{
    public class Radiator
    {
        public Guid Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Brand { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string Model { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Type { get; set; } = string.Empty;  // e.g. "Big Car", "Small Car"

        // ===== PRICING FIELDS (future use) =====
        [Range(0, double.MaxValue)]
        public decimal RetailPrice { get; set; } = 0;

        [Range(0, double.MaxValue)]
        public decimal? TradePrice { get; set; }

        [Range(0, double.MaxValue)]
        public decimal? CostPrice { get; set; }

        public bool IsPriceOverridable { get; set; } = true;

        [Range(0, 100)]
        public decimal? MaxDiscountPercent { get; set; } = 20;

        // ===== DIMENSION FIELDS =====
        [StringLength(200)]
        public string? CoreDimension { get; set; }   // Core size e.g. "680x408x16"

        [StringLength(200)]
        public string? Dimension { get; set; }        // Overall size e.g. "710x440x40"

        [StringLength(500)]
        public string? ImageUrl { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<StockLevel> StockLevels { get; set; } = new List<StockLevel>();
    }
}
