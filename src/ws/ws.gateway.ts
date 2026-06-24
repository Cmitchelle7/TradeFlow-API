import {
  WebSocketGateway,
  WebSocketServer,
  OnModuleInit,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { RedisService } from '../common/redis/redis.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/ws',
})
export class AppGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AppGateway.name);

  constructor(private readonly redisService: RedisService) {}

  onModuleInit() {
    this.logger.log('WebSocket Gateway initialized');

    this.redisService.subscribe('ws:events', (message) => {
      try {
        const payload = JSON.parse(message);
        this.server.to(payload.room).emit(payload.event, payload.data);
        this.server.to('room:global').emit(payload.event, payload.data);
      } catch (err) {
        this.logger.error('Failed to broadcast WS event', err);
      }
    });
  }

  handleConnection(client: AuthenticatedSocket) {
    const token = client.handshake.auth?.token || client.handshake.query?.token;
    if (!token) {
      this.logger.warn('WS connection rejected: no token');
      client.disconnect();
      return;
    }

    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      client.userId = payload.sub || payload.userId;
      if (client.userId) {
        client.join(oom:user_);
        this.logger.log(User  connected);
      }
      client.join('room:global');
    } catch {
      this.logger.warn('WS connection rejected: invalid token');
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(User  disconnected);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() room: string) {
    if (client.userId && room.startsWith('room:user_') && room === oom:user_) {
      client.join(room);
    }
  }
}
