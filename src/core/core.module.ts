import { Module } from '@nestjs/common';

import { HealthCheckService } from './health-check/health-check.service';

@Module({
  imports: [],
  controllers: [],
  providers: [HealthCheckService],
})
export class CoreModule {}
