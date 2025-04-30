import { Config } from '@config';
import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService<Config, true>) {}
  get<T extends keyof Config>(key: T): Config[T] {
    return this.configService.get(key, { infer: true });
  }
}
