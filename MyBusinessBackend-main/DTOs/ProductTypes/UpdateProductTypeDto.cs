using System.ComponentModel.DataAnnotations;

namespace RadiatorStockAPI.DTOs.ProductTypes;

public class UpdateProductTypeDto
{
    [Required]
    [StringLength(50)]
    public string Name { get; set; } = string.Empty;
}
