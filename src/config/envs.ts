import 'dotenv/config';
import * as z from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number(),
  NATS_SERVERS: z.array(z.string()),
  AUTH_MS_DB_URL: z.string(),
  AUTH_JWT_SECRET: z.string()
});

const validSchema = envSchema.safeParse({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
});

if (!validSchema.success) {
  console.error('Invalid environment variables: ', validSchema.error.issues);
  throw new Error('Invalid environment variables');
}

console.log(validSchema.data)

export const envs = {
  port: validSchema.data.PORT,
  natsServers: validSchema.data.NATS_SERVERS,
  authMsDbUrl: validSchema.data.AUTH_MS_DB_URL,
  authJwtSecret: validSchema.data.AUTH_JWT_SECRET
}