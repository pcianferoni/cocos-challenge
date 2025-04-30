import { Controller, Get } from '@nestjs/common';

import { HealthCheckService } from '@core/health-check/health-check.service';

@Controller('healthcheck')
export class HealthCheckController {
  constructor(private readonly healthCheckService: HealthCheckService) {}

  @Get()
  sendStatus() {
    return this.healthCheckService.sendStatus();
  }
}
