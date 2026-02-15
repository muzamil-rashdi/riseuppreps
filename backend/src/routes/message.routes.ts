import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(authenticate, authorize('ADMIN', 'SPONSOR'));

router.get('/', MessageController.getConversations);
router.get('/:userId', MessageController.getMessagesWith);
router.post('/', MessageController.send);
router.put('/:id/read', MessageController.markAsRead);

export default router;
