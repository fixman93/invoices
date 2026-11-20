import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import apiRoutes from './routes/index.js';

const app = express();

app.set('trust proxy', 1); // Heroku / Vercel sit behind a proxy (needed for rate limiting and secure cookies)
app.disable('x-powered-by');

app.use(helmet());
app.use(cors({ origin: env.clientUrls, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
