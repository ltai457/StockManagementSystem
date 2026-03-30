using System.ComponentModel.DataAnnotations;

namespace RadiatorStockAPI.DTOs.ProductTypes;

public class CreateProductTypeDto
{
    [Required]
    [StringLength(50)]
    public string Name { get; set; } = string.Empty;
}
