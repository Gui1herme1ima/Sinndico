import { Router } from 'express';

import { register, remove } from '../controllers/deviceTokenController';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(asyncHandler(authenticate));

router.post('/', asyncHandler(register));
router.delete('/', asyncHandler(remove));

export default router;
