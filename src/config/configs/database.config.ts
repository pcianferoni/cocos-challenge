import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const databaseSchema = z.object({
  databaseUrl: z.string({ message: 'DATABASE_API_URL is required' }),
});

export const DATABASE_CONFIG_KEY = 'database';

export const databaseConfig = registerAs(DATABASE_CONFIG_KEY, () =>
  databaseSchema.parse({
    databaseUrl: process.env.DATABASE_URL,
  }),
);

export type DatabaseConfig = z.infer<typeof databaseSchema>;
export type DatabaseConfigKey =
  `${typeof DATABASE_CONFIG_KEY}.${keyof DatabaseConfig}`;
