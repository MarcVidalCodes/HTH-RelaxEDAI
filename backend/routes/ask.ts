import { Router } from 'express';
import { askController } from '../controllers/askController';

const router = Router();

router.post('/', askController);

export default router;