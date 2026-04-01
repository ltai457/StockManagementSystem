


using RadiatorStockAPI.DTOs.Radiators;
using RadiatorStockAPI.DTOs.Common;

namespace RadiatorStockAPI.Services.Radiators;

public interface IGetRadiatorHandler
{
    Task<Result<object>> GetAllAsync(int? pageNumber, int? pageSize);
    Task<Result<RadiatorResponseDto>> GetByIdAsync(Guid id);
}

public class GetRadiatorHandler : IGetRadiatorHandler
{
    private readonly IRadiatorService _service;
 
 
 
    public GetRadiatorHandler(IRadiatorService service) => _service = service;

    public async Task<Result<object>> GetAllAsync(int? pageNumber, int? pageSize)
    {
        if (pageNumber.HasValue || pageSize.HasValue)
        {
            var p = new PaginationParams { PageNumber = pageNumber ?? 1, PageSize = pageSize ?? 20 };
            var (items, total) = await _service.GetPagedAsync(p.PageNumber, p.PageSize);
            return Result<object>.Ok(new PagedResult<RadiatorListDto>
            {
                Items = items.Select(RadiatorMapper.ToListDto).ToList(),
                PageNumber = p.PageNumber,
                PageSize = p.PageSize,
                TotalCount = total,
                TotalPages = (int)Math.Ceiling(total / (double)p.PageSize)
            });
        }

        var radiators = await _service.GetAllAsync();
        return Result<object>.Ok(radiators.Select(RadiatorMapper.ToListDto).ToList());
    }

    public async Task<Result<RadiatorResponseDto>> GetByIdAsync(Guid id)
    {
        var r = await _service.GetByIdAsync(id);
        if (r is null)
        {
            return Result<RadiatorResponseDto>.NotFound($"Radiator {id} not found.");
        }
        return Result<RadiatorResponseDto>.Ok(RadiatorMapper.ToResponseDto(r));
    }
}
