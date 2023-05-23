import { OpenapiService } from './openapi.service';
import { OpenapiController } from './openapi.controller';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    ThrottlerModule.forRoot({
      ttl: Number(process.env.GLOBAL_TTL),
      limit: Number(process.env.GLOBAL_LIMIT),
    }),
  ],
  controllers: [OpenapiController],
  providers: [OpenapiService],
})
export class OpenapiModule {}
