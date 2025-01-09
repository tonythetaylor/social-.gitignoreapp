import prisma from '../models/prismaClient';
import { Notification } from '@prisma/client';

/**
 * Create a notification
 */
export const createNotification = async (
  type: string,
  message: string,
  postId: number | null,
  userId: number,
  senderId: number
): Promise<Notification> => {
  return await prisma.notification.create({
    data: {
      type,
      message,
      postId,
      userId, // Recipient
      senderId, // Action performer
    },
  });
};

/**
 * Fetch notifications for a user
 */
export const getNotificationsForUser = async (userId: number): Promise<Notification[]> => {
  return await prisma.notification.findMany({
    where: { userId },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          profilePicture: true,
        },
      },
      post: {
        select: {
          id: true,
          content: true,
          imageUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

/**
 * Mark notifications as read
 */
export const markNotificationsAsRead = async (userId: number): Promise<number> => {
  const { count } = await prisma.notification.updateMany({
    where: {
      userId,
    },
    data: {
      read: true,
    },
  });

  return count;
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: number, userId: number): Promise<boolean> => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification || notification.userId !== userId) {
    return false; // Unauthorized
  }

  await prisma.notification.delete({
    where: { id: notificationId },
  });

  return true;
};