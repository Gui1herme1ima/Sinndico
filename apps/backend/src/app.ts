import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { pool } from './database/connection';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import chatsRoutes from './routes/chats';
import comunicadosRoutes from './routes/comunicados';
import encomendasRoutes from './routes/encomendas';
import solicitacoesRoutes from './routes/solicitacoes';

export const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? true, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/solicitacoes', solicitacoesRoutes);
app.use('/api/encomendas', encomendasRoutes);
app.use('/api/comunicados', comunicadosRoutes);
app.use('/api/chats', chatsRoutes);

app.use(errorHandler);
