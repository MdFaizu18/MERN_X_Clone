import {Router} from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { deleteNotification, getNotifications } from '../controllers/notificationController.js';

const router = Router();

router.use(authenticateUser);

router.get('/get',getNotifications);
router.get('/delete',deleteNotification)

export default router;