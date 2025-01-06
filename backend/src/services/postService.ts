import prisma from '../models/prismaClient';
import { Post } from '@prisma/client'; // Assuming you're using Prisma's Post model

// Service method to create a post
export const createPost = async (userId: number, content: string, imageUrl: string | null): Promise<Post> => {
  console.log('createPost ', imageUrl)
  return await prisma.post.create({
    data: {
      userId,        // Reference to the user who created the post
      content,       // Post content
      imageUrl,      // Image URL (if any)
    },
  });
};

// Service method to fetch posts with pagination and user data
export const getPosts = async (page: number, limit: number) => {
  const offset = (page - 1) * limit;  // Calculate offset based on page and limit

  const posts = await prisma.post.findMany({
    skip: offset,  // Skip the posts for previous pages
    take: limit,   // Limit the number of posts per page
    orderBy: {
      createdAt: 'desc',  // Order posts by creation date (newest first)
    },
    include: {
      user: {
        select: {
          username: true,
          profilePicture: true,
        },
      },
    },
  });

  const totalPosts = await prisma.post.count();  // Count the total number of posts in the database

  return { posts, totalPosts };  // Return posts and the total number of posts for pagination
};

// Service method to update a post
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