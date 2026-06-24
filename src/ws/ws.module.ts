import { Module } from '@nestjs/common';
import { AppGateway } from './ws.gateway';

@Module({
  providers: [AppGateway],
  exports: [AppGateway],
})
export class WsModule {}
