namespace RadiatorStockAPI.DTOs.Stock;

public class RadiatorWithStockDto
{
    public Guid Id { get; set; }
    public string Brand { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string? Type { get; set; }

    public string? CoreDimension { get; set; }
    public string? Dimension { get; set; }
    public string? ImageUrl { get; set; }

    public Dictionary<string, int> Stock { get; set; } = new();
    public int TotalStock { get; set; }
    public bool HasLowStock { get; set; }
    public bool HasOutOfStock { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
