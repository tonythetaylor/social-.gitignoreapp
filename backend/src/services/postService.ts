// services/postService.ts
import prisma from '../models/prismaClient';
import { Post } from '@prisma/client';

export const createPost = async (
  userId: number,
  content: string,
  imageUrl: string | null,
  audioUrl: string | null
): Promise<Post> => {
  return await prisma.post.create({
    data: {
      userId,
      content,
      imageUrl,
      audioUrl, // Add audio URL
    },
  });
};

// Updated getPosts to include likes and comments
export const getPosts = async (page: number, limit: number, currentUserId: number) => {
  const offset = (page - 1) * limit;

  const posts = await prisma.post.findMany({
    skip: offset,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          username: true,
          profilePicture: true,
        },
      },
      likes: {
        select: {
          id: true, // To count likes
          userId: true, // To check if current user liked
        },
      },
      comments: {
        select: {
          id: true, // To count comments
        },
      },
    },
  });

  const totalPosts = await prisma.post.count();

  // Map posts to include likeCount, commentCount, and isLiked
  const mappedPosts = posts.map(post => ({
    ...post,
    likeCount: post.likes.length,
    commentCount: post.comments.length,
    isLiked: post.likes.some(like => like.userId === currentUserId),
  }));

  return { posts: mappedPosts, totalPosts };
};

export const updatePost = async (userId: number, postId: number, content: string): Promise<Post | null> => {
  // Find the post by ID
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  // If the post doesn't exist or the user is not the owner, return null
  if (!post || post.userId !== userId) {
    return null; // User is not the owner or post does not exist
  }

  // Update the post content
  return await prisma.post.update({
    where: { id: postId },
    data: {
      content,  // Update the content
    },
  });
};

// Service to delete a post
export const deletePost = async (userId: number, postId: number): Promise<boolean> => {
  // Find the post by ID
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  // Check if the post exists and the user is the owner
  if (!post || post.userId !== userId) {
    return false; // Post does not exist or user is not the owner
  }

  // Delete the post
  await prisma.post.delete({
    where: { id: postId },
  });

  return true;
};