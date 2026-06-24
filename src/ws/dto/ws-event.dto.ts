export class WsEventPayload {
  event: 'InvoiceStatusChanged' | 'LiquidityPoolUpdated' | 'YieldAccrued';
  room: string;
  data: Record<string, any>;
  timestamp: number;
}
