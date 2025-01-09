import { Router } from 'express';
import {
  fetchNotifications,
  markAsRead,
  deleteNotificationById,
} from '../controllers/notificationController';
import authenticateJWT from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateJWT, fetchNotifications); // Fetch notifications
router.put('/read', authenticateJWT, markAsRead); // Mark notifications as read
router.delete('/:notificationId', authenticateJWT, deleteNotificationById); // Delete a notification

export default router;