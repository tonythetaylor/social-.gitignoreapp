import { Request, Response } from 'express';
import {
  createNotification,
  getNotificationsForUser,
  markNotificationsAsRead,
  deleteNotification,
} from '../services/notificationService';
import { User } from '@prisma/client';

/**
 * Fetch notifications for the logged-in user
 */
export const fetchNotifications = async (req: Request, res: Response): Promise<void> => {
  const user = req.user as User;

  if (!user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const notifications = await getNotificationsForUser(user.id);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

/**
 * Mark all notifications as read
 */
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  const user = req.user as User;

  if (!user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const count = await markNotificationsAsRead(user.id);
    res.status(200).json({ message: `${count} notifications marked as read` });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark notifications as read' });
  }
};

/**
 * Delete a notification
 */
export const deleteNotificationById = async (req: Request, res: Response): Promise<void> => {
  const user = req.user as User;
  const { notificationId } = req.params;

  if (!user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const deleted = await deleteNotification(parseInt(notificationId), user.id);

    if (!deleted) {
      res.status(403).json({ message: 'Unauthorized to delete this notification' });
      return;
    }

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
};