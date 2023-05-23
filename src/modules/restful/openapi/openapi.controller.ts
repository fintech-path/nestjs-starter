import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { Public } from '../../../core/decorators/public.decorator';
import { OpenapiService } from './openapi.service';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('openapi/')
@UseGuards(ThrottlerGuard)
export class OpenapiController {
  constructor(private readonly openapiService: OpenapiService) {}

  @Public()
  @Throttle(1, 10)
  @Get('baiduBaike/:key')
  async baiduBaike(
    @Param('key')
    key: string,
  ): Promise<Observable<AxiosResponse<any>>> {
    return this.openapiService.baiduBaike(key);
  }

  @Public()
  @Get('myip')
  async getMyIp(): Promise<Observable<AxiosResponse<any>>> {
    return this.openapiService.myip();
  }
}
