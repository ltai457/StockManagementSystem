using System.ComponentModel.DataAnnotations;

namespace RadiatorStockAPI.DTOs.Brands;

public class CreateBrandDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
}
