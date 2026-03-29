using RadiatorStockAPI.DTOs.Radiators;
using RadiatorStockAPI.DTOs.Common;

namespace RadiatorStockAPI.Services.Radiators;

public interface ICreateRadiatorHandler
{
    Task<Result<RadiatorResponseDto>> CreateAsync(CreateRadiatorDto dto);
}

public class CreateRadiatorHandler : ICreateRadiatorHandler
{
    private readonly IRadiatorService _service;
    public CreateRadiatorHandler(IRadiatorService service) => _service = service;

    public async Task<Result<RadiatorResponseDto>> CreateAsync(CreateRadiatorDto dto)
    {
        var radiator = await _service.CreateAsync(dto);
        if (radiator is null)
        {
            return Result<RadiatorResponseDto>.Conflict($"Code '{dto.Code}' already exists.");
        }
        var responseDto = RadiatorMapper.ToResponseDto(radiator);
        return Result<RadiatorResponseDto>.Created(responseDto, "GetById", new { id = responseDto.Id });
    }
}
