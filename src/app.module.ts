import { ConfigModule, ConfigService, configurations } from '@config';
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';

import { BrokerModule } from './broker/broker.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [...configurations],
      envFilePath: ['.env', '.env.local', '.env.development'],
    }),
    ConfigModule,
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      useFactory: (config: ConfigService) => {
        return {
          pinoHttp: {
            level: 'trace',
            transport: { target: 'pino-pretty' },
            formatters: {
              level(level) {
                return { level };
              },
            },
            autoLogging: false,
            serializers: {
              req: () => undefined,
              res: () => undefined,
            },
          },
        };
      },
    }),
    CoreModule,
    BrokerModule,
  ],
})
export class AppModule {}
