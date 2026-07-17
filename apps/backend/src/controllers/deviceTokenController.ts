import { Request, Response } from 'express';
import { z } from 'zod';

import { registerDeviceToken, removeDeviceToken } from '../models/DeviceToken';

export const registerDeviceTokenSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(['web', 'android', 'ios']),
});

export const removeDeviceTokenSchema = z.object({
  token: z.string().min(1),
});

function tenantContextOf(req: Request) {
  return { userId: req.user!.id, condominioId: req.user!.condominioId };
}

export async function register(req: Request, res: Response) {
  const input = registerDeviceTokenSchema.parse(req.body);

  const deviceToken = await registerDeviceToken(tenantContextOf(req), {
    condominioId: req.user!.condominioId!,
    userId: req.user!.id,
    token: input.token,
    platform: input.platform,
  });

  res.status(201).json({ id: deviceToken.id, platform: deviceToken.platform });
}

export async function remove(req: Request, res: Response) {
  const input = removeDeviceTokenSchema.parse(req.body);
  await removeDeviceToken(tenantContextOf(req), input.token);
  res.status(204).send();
}
