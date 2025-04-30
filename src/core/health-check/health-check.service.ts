import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthCheckService {
  sendStatus() {
    return { message: 'Server is ready!' };
  }
}
