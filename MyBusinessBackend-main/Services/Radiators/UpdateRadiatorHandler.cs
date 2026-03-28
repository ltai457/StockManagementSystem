using RadiatorStockAPI.DTOs.Radiators;
using RadiatorStockAPI.DTOs.Common;

namespace RadiatorStockAPI.Services.Radiators;

public interface IUpdateRadiatorHandler
{
    Task<Result<RadiatorResponseDto>> UpdateAsync(Guid id, UpdateRadiatorDto dto);
    Task<Result<object>> DeleteAsync(Guid id);
}

public class UpdateRadiatorHandler : IUpdateRadiatorHandler
{
    private readonly IRadiatorService _service;
    public UpdateRadiatorHandler(IRadiatorService service) => _service = service;

    public async Task<Result<RadiatorResponseDto>> UpdateAsync(Guid id, UpdateRadiatorDto dto)
    {
        if (!await _service.ExistsAsync(id)) return Result<RadiatorResponseDto>.NotFound($"Radiator {id} not found.");
        var r = await _service.UpdateAsync(id, dto);
        return r is null
            ? Result<RadiatorResponseDto>.Conflict("Code conflict.")
            : Result<RadiatorResponseDto>.Ok(RadiatorMapper.ToResponseDto(r));
    }

    public async Task<Result<object>> DeleteAsync(Guid id)
    {
        if (!await _service.ExistsAsync(id)) return Result<object>.NotFound($"Radiator {id} not found.");
        return await _service.DeleteAsync(id) ? Result<object>.Deleted() : Result<object>.Fail("Failed to delete.");
    }
}
