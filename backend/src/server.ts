import app from './app.js';
import { env } from './config/env.js';

const server = app.listen(env.port, () => {
  console.log(`Server running in ${env.nodeEnv} mode on http://localhost:${env.port}`);
});

const shutdown = (signal: string): void => {
  console.log(`${signal} received, shutting down...`);
  server.close(() => process.exit(0));
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
