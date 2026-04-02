import { Module } from '@nestjs/common';
import { TelemetryGateway } from './telemetry.gateway';
import { TelemetryService } from './telemetry.service';
import { TelemetryController } from './telemetry.controller';

@Module({
  providers: [TelemetryGateway, TelemetryService],
  controllers: [TelemetryController],
})
export class TelemetryModule {}
