import 'dotenv/config';

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const required = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const optional = (name: string): string => process.env[name]?.trim() ?? '';

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: toNumber(process.env.PORT, 5000),
  /** Comma-separated list of allowed frontend origins. */
  clientUrls: (process.env.CLIENT_URL ?? 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
  mongoUri: required('MONGO_URI'),
  mongoDbName: process.env.MONGO_DB_NAME ?? 'invoices',
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  r2: {
    accountId: optional('R2_ACCOUNT_ID'),
    accessKeyId: optional('R2_ACCESS_KEY_ID'),
    secretAccessKey: optional('R2_SECRET_ACCESS_KEY'),
    bucket: optional('R2_BUCKET'),
    publicUrl: optional('R2_PUBLIC_URL').replace(/\/+$/, ''),
    prefix: (process.env.R2_PREFIX ?? 'invoices').replace(/^\/+|\/+$/g, ''),
  },
} as const;

export const isProduction = env.nodeEnv === 'production';

export const isR2Configured = Boolean(
  env.r2.accountId && env.r2.accessKeyId && env.r2.secretAccessKey && env.r2.bucket && env.r2.publicUrl,
);
