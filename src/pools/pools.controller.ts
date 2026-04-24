import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApyHistoryPoint, generateMockApyHistory } from './apy-history.helper';
import { PoolIdParamDto } from './dto/pool-id-param.dto';

@ApiTags('pools')
@Controller('api/v1/pools')
export class PoolsController {
  @Get(':poolId/apy-history')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get 7-day simulated APY history for a pool' })
  @ApiParam({ name: 'poolId', description: 'Pool ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'APY history retrieved successfully',
    type: ApyHistoryPoint,
    isArray: true,
  })
  getApyHistory(@Param() params: PoolIdParamDto): ApyHistoryPoint[] {
    return generateMockApyHistory(params.poolId);
  }
}

