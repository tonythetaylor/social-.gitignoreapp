import prisma from '../models/prismaClient';
import { Like } from '@prisma/client';

export const likePost = async (userId: number, postId: number): Promise<Like> => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { user: true },
  });

  if (!post) {
    throw new Error('Post not found');
  }

  // Create a like
  const like = await prisma.like.create({
    data: {
      userId,
      postId,
    },
  });

  // Create a notification for the post owner
  if (post.userId !== userId) {
    const sender = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    await prisma.notification.create({
      data: {
        type: 'like',
        message: `${sender?.username} liked your post.`,
        postId,
        userId: post.userId, // Recipient (post owner)
        senderId: userId, // Action performer
      },
    });
  }

  return like;
};

export const unlikePost = async (userId: number, postId: number): Promise<Like | null> => {
  const like = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });

  if (!like) {
    return null;
  }

  return await prisma.like.delete({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });
};

export const getPostLikes = async (postId: number): Promise<Like[]> => {
  return await prisma.like.findMany({
    where: {
      postId,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          profilePicture: true,
        },
      },
    },
  });
};

export const isPostLikedByUser = async (userId: number, postId: number): Promise<boolean> => {
  const like = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });
  return !!like;
};