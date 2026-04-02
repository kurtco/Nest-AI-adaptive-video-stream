import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { Socket } from 'socket.io';
import { TelemetryService } from './telemetry.service';
import { HlsMetricsDto } from './dto/hls-metrics.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class TelemetryGateway {
  constructor(private readonly telemetryService: TelemetryService) {}

  @UsePipes(new ValidationPipe({ transform: true }))
  @SubscribeMessage('hls-telemetry')
  async handleHlsMetrics(
    @MessageBody() data: HlsMetricsDto,
    @ConnectedSocket() client: Socket,
  ) {
    // El servicio ahora recibe datos garantizados por el DTO
    const response = await this.telemetryService.processMetrics(data);

    if (response && typeof response === 'object' && 'action' in response) {
      client.emit('player-command', response.action);
    }
  }
}
