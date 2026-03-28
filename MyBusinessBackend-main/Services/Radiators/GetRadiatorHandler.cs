using RadiatorStockAPI.DTOs.Radiators;
using RadiatorStockAPI.DTOs.Common;

namespace RadiatorStockAPI.Services.Radiators;

public interface IGetRadiatorHandler
{
    Task<Result<List<RadiatorListDto>>> GetAllAsync();
    Task<Result<PagedResult<RadiatorListDto>>> GetPagedAsync(PaginationParams p);
    Task<Result<RadiatorResponseDto>> GetByIdAsync(Guid id);
}

public class GetRadiatorHandler : IGetRadiatorHandler
{
    private readonly IRadiatorService _service;
    public GetRadiatorHandler(IRadiatorService service) => _service = service;

    public async Task<Result<List<RadiatorListDto>>> GetAllAsync()
        => Result<List<RadiatorListDto>>.Ok((await _service.GetAllAsync()).Select(RadiatorMapper.ToListDto).ToList());

    public async Task<Result<PagedResult<RadiatorListDto>>> GetPagedAsync(PaginationParams p)
    {
        var (items, total) = await _service.GetPagedAsync(p.PageNumber, p.PageSize);
        return Result<PagedResult<RadiatorListDto>>.Ok(new PagedResult<RadiatorListDto>
        {
            Items = items.Select(RadiatorMapper.ToListDto).ToList(),
            PageNumber = p.PageNumber, PageSize = p.PageSize,
            TotalCount = total,
            TotalPages = (int)Math.Ceiling(total / (double)p.PageSize)
        });
    }

    public async Task<Result<RadiatorResponseDto>> GetByIdAsync(Guid id)
    {
        var r = await _service.GetByIdAsync(id);
        return r is null
            ? Result<RadiatorResponseDto>.NotFound($"Radiator {id} not found.")
            : Result<RadiatorResponseDto>.Ok(RadiatorMapper.ToResponseDto(r));
    }
}
