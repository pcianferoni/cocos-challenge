import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const appSchema = z.object({
  // nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z
    .string()
    .transform((value) => parseInt(value, 10))
    .refine((value) => !Number.isNaN(value), {
      message: 'PORT must be a number',
    })
    .default('4000'),
  serviceName: z.string({ message: 'SERVICE_NAME is required' }),
});

export const APP_CONFIG_KEY = 'app';

export const appConfig = registerAs(APP_CONFIG_KEY, () =>
  appSchema.parse({
    port: process.env.PORT,
    serviceName: process.env.SERVICE_NAME,
  }),
);

export type AppConfig = z.infer<typeof appSchema>;
export type AppConfigKey = `${typeof APP_CONFIG_KEY}.${keyof AppConfig}`;
