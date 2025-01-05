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

// Service method to fetch posts with pagination
export const getPosts = async (page: number, limit: number) => {
  const offset = (page - 1) * limit;  // Calculate offset based on page and limit

  const posts = await prisma.post.findMany({
    skip: offset,  // Skip the posts for previous pages
    take: limit,   // Limit the number of posts per page
    orderBy: {
      createdAt: 'desc',  // Order posts by creation date (newest first)
    },
  });

  const totalPosts = await prisma.post.count();  // Count the total number of posts in the database

  return { posts, totalPosts };  // Return posts and the total number of posts for pagination
};