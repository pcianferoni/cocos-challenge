import { APP_CONFIG_KEY, AppConfig, AppConfigKey } from '../configs/app.config';
import {
  DATABASE_CONFIG_KEY,
  DatabaseConfig,
  DatabaseConfigKey,
} from '../configs/database.config';

type ConfigKey = AppConfigKey | DatabaseConfigKey;

export type Config = {
  [K in ConfigKey]: K extends `${typeof APP_CONFIG_KEY}.${infer AppKey}`
    ? AppConfig[AppKey & keyof AppConfig]
    : K extends `${typeof DATABASE_CONFIG_KEY}.${infer DatabaseKey}`
    ? DatabaseConfig[DatabaseKey & keyof DatabaseConfig]
    : never;
} & { app: AppConfig } & { database: DatabaseConfig };
