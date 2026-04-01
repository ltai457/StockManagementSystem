using System.ComponentModel.DataAnnotations;

namespace RadiatorStockAPI.DTOs.Radiators;

public class CreateRadiatorDto
{
    [Required, StringLength(100)]
    public string Brand { get; set; } = string.Empty;

    [Required, StringLength(50)]
    public string Code { get; set; } = string.Empty;

    [Required, StringLength(200)]
    public string Model { get; set; } = string.Empty;

    [Required, StringLength(50)]
    public string Type { get; set; } = string.Empty;

    [StringLength(200)]
    public string? CoreDimension { get; set; }

    [StringLength(200)]
    public string? Dimension { get; set; }

    [StringLength(500)]
    public string? ImageUrl { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }

    public Dictionary<string, int>? InitialStock { get; set; }
}
