import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { pool } from './database/connection';
import { errorHandler } from './middleware/errorHandler';
import areasComunsRoutes from './routes/areas-comuns';
import assembleiasRoutes from './routes/assembleias';
import authRoutes from './routes/auth';
import chatsRoutes from './routes/chats';
import comidaRoutes from './routes/comida';
import comunicadosRoutes from './routes/comunicados';
import condominiosRoutes from './routes/condominios';
import dashboardRoutes from './routes/dashboard';
import deviceTokensRoutes from './routes/deviceTokens';
import encomendasRoutes from './routes/encomendas';
import reservasRoutes from './routes/reservas';
import residenciasRoutes from './routes/residencias';
import solicitacoesRoutes from './routes/solicitacoes';
import usersRoutes from './routes/users';
import visitantesRoutes from './routes/visitantes';

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
app.use('/api/condominios', condominiosRoutes);
app.use('/api/chats', chatsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/device-tokens', deviceTokensRoutes);
app.use('/api/visitantes', visitantesRoutes);
app.use('/api/comida', comidaRoutes);
app.use('/api/areas-comuns', areasComunsRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/residencias', residenciasRoutes);
app.use('/api/assembleias', assembleiasRoutes);

app.use(errorHandler);
