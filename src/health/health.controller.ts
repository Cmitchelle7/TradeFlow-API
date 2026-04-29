import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

/**
 * Controller for protocol health and monitoring endpoints.
 * Provides public status information about system components.
 */
@Controller('api/v1/protocol')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Retrieves the current operational status of the protocol.
   * 
   * @returns A detailed health report including database and indexer status.
   */
  @Get('health')
  async getHealth() {
    return this.healthService.getProtocolHealth();
  }
}