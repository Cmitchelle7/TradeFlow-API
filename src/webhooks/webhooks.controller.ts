import { Controller, Post, Body } from '@nestjs/common';

@Controller('api/v1/webhooks')
export class WebhooksController {
  @Post('stellar')
  async receiveStellarEvent(@Body() payload: any) {
    console.log('Received Stellar Event:', payload);
    
    return {
      received: true,
    };
  }
}
