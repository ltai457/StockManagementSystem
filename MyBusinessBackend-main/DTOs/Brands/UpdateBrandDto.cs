using System.ComponentModel.DataAnnotations;

namespace RadiatorStockAPI.DTOs.Brands;

public class UpdateBrandDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
}
