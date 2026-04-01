namespace RadiatorStockAPI.DTOs.Radiators;

public class RadiatorListDto
{
    public Guid Id { get; set; }
    public string Brand { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public Dictionary<string, int> Stock { get; set; } = new();
    public string? CoreDimension { get; set; }
    public string? Dimension { get; set; }
    public string? ImageUrl { get; set; }
    public string? Notes { get; set; }
}
