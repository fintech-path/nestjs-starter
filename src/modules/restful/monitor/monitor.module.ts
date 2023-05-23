import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.check.controller';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    TerminusModule,
    HttpModule,
    PrometheusModule.register({
      path: '/audit/metrics',
    }),
  ],
  controllers: [HealthController],
})
export class MonitorModule {}
