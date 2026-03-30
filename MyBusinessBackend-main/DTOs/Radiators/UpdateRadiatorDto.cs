using System.ComponentModel.DataAnnotations;

namespace RadiatorStockAPI.DTOs.Radiators;

public class UpdateRadiatorDto
{
    [StringLength(100)]
    public string? Brand { get; set; }

    [StringLength(50)]
    public string? Code { get; set; }

    [StringLength(200)]
    public string? Model { get; set; }

    [StringLength(50)]
    public string? Type { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? RetailPrice { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? TradePrice { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? CostPrice { get; set; }

    public bool? IsPriceOverridable { get; set; }

    [Range(0, 100)]
    public decimal? MaxDiscountPercent { get; set; }

    [StringLength(200)]
    public string? CoreDimension { get; set; }

    [StringLength(200)]
    public string? Dimension { get; set; }

    [StringLength(500)]
    public string? ImageUrl { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }
}
