namespace RadiatorStockAPI.Services.Stock;

public sealed class StockConcurrencyException : Exception
{
    public StockConcurrencyException(Exception innerException)
        : base("Stock changed while this request was being processed. Refresh the stock level and try again.", innerException)
    {
    }
}
