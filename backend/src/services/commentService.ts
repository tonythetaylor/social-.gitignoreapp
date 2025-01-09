// services/commentService.ts
import prisma from '../models/prismaClient';
import { Comment } from '@prisma/client';

export const addComment = async (
    userId: number,
    postId: number,
    content: string,
    audioUrl: string | null
  ): Promise<Comment> => {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { user: true },
    });
  
    if (!post) {
      throw new Error('Post not found');
    }
  
    // Create a comment
    const comment = await prisma.comment.create({
      data: {
        userId,
        postId,
        content,
        audioUrl,
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
  
    // Create a notification for the post owner
    if (post.userId !== userId) {
      await prisma.notification.create({
        data: {
          type: 'comment',
          message: `${comment.user.username} commented on your post.`,
          postId: postId,
          userId: post.userId, // Recipient (post owner)
          senderId: userId, // Action performer
        },
      });
    }
  
    return comment;
  };

export const getCommentsForPost = async (postId: number): Promise<Comment[]> => {
  return await prisma.comment.findMany({
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
    orderBy: {
      createdAt: 'asc',
    },
  });
};

export const deleteComment = async (commentId: number, userId: number): Promise<Comment | null> => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment || comment.userId !== userId) {
    return null;
  }

  return await prisma.comment.delete({
    where: { id: commentId },
  });
};