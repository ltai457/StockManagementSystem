using System.ComponentModel.DataAnnotations;

namespace RadiatorStockAPI.DTOs.Stock;

public class StockTransferDto
{
    [Required]
    public Guid RadiatorId { get; set; }

    [Required]
    [StringLength(10)]
    public string FromWarehouseCode { get; set; } = string.Empty;

    [Required]
    [StringLength(10)]
    public string ToWarehouseCode { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    [StringLength(250)]
    public string? Reason { get; set; }

}
