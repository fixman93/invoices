import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('strictQuery', true);

mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));
mongoose.connection.on('reconnected', () => console.log('MongoDB reconnected'));
mongoose.connection.on('error', (err) => console.error('MongoDB error:', err));

export const connectDB = async (): Promise<void> => {
  const conn = await mongoose.connect(env.mongoUri, {
    dbName: env.mongoDbName,
    serverSelectionTimeoutMS: 10_000,
  });
  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.connection.close();
};

/** Human-readable connection state for health checks. */
export const getDbStatus = (): string => {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] ?? 'unknown';
};
