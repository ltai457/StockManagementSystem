namespace RadiatorStockAPI.DTOs.Radiators;

public class RadiatorListDto
{
    public Guid Id { get; set; }
    public string Brand { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public decimal RetailPrice { get; set; }
    public decimal? TradePrice { get; set; }
    public bool IsPriceOverridable { get; set; }
    public decimal? MaxDiscountPercent { get; set; }
    public Dictionary<string, int> Stock { get; set; } = new();
    public string? CoreDimension { get; set; }
    public string? Dimension { get; set; }
    public string? ImageUrl { get; set; }
    public string? Notes { get; set; }
}
