import { Module } from '@nestjs/common';
import { RiskService } from './risk.service';

/**
 * Module responsible for financial risk assessment.
 * Exports the RiskService for use in other parts of the application.
 */
@Module({
  providers: [RiskService],
  exports: [RiskService],
})
export class RiskModule {}
