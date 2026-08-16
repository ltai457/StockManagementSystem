using System.ComponentModel.DataAnnotations;

namespace RadiatorStockAPI.DTOs.Stock;

public class BulkUpdateStockDto
{
    [Required]
    public List<StockUpdateItemDto> Updates { get; set; } = new();

    [StringLength(250)]
    public string? Reason { get; set; }
}
