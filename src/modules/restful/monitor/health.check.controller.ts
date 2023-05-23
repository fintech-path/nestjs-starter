import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { Public } from 'src/core/decorators/public.decorator';

@Controller('/audit')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
  ) {}

  @Get('/health')
  @Public()
  @HealthCheck()
  async healthCheck() {
    const healthCheckInfo = await this.health.check([
      () => this.http.pingCheck('baidu.com', 'https://www.baidu.com'),
      //() => this.memory.checkHeap('memory_heap', process.memoryUsage().heapTotal * 0.9),
      //() => this.memory.checkRSS('memory_rss', process.memoryUsage().rss),
      () =>
        this.disk.checkStorage('storage', {
          thresholdPercent: 0.8,
          path: '/',
        }),
    ]);

    return {
      platform: process.platform,
      resourceUsage: process.resourceUsage(),
      memory: process.memoryUsage(),
      status: healthCheckInfo,
    };
  }
}
