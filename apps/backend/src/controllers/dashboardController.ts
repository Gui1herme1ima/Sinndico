import { Request, Response } from 'express';

import { getDashboardSummary } from '../models/Dashboard';

export async function summary(req: Request, res: Response) {
  const data = await getDashboardSummary({ userId: req.user!.id, condominioId: req.user!.condominioId });
  res.json(data);
}
