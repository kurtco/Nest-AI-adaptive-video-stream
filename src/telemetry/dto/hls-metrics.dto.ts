import { IsNumber, IsString, IsNotEmpty, Min } from 'class-validator';

export class HlsMetricsDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  bufferLength: number;

  @IsNumber()
  @IsNotEmpty()
  bitrate: number;

  @IsNumber()
  @IsNotEmpty()
  bandwidth: number;

  @IsNumber()
  @IsNotEmpty()
  latency: number;

  @IsString()
  @IsNotEmpty()
  eventType: string;
}
