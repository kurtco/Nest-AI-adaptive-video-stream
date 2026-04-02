/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { HlsMetricsDto } from './dto/hls-metrics.dto';

/**
 * TELEMETRY CONTROLLER:
 * Exposes endpoints for system health and manual agent overrides.
 */
@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  /**
   * Health check endpoint to verify the AIdaptive-Stream engine status.
   */
  @Get('status')
  getStatus() {
    return {
      status: 'healthy',
      engine: 'AIdaptive-Stream-v1',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * MANUAL DIAGNOSIS:
   * Allows manual injection of metrics to test the LangGraph agent logic.
   * Useful for debugging ABR decisions without a live HLS feed.
   */
  @Post('diagnose')
  @HttpCode(HttpStatus.OK)
  async manualDiagnosis(@Body() metrics: HlsMetricsDto) {
    // Forwarding validated metrics to the agentic workflow
    return await this.telemetryService.processMetrics(metrics);
  }
}
