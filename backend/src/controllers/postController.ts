// controllers/postController.ts
import { Request, Response } from 'express';
import { createPost, getPosts, updatePost, deletePost } from '../services/postService';
import { User } from '@prisma/client';  // Assuming you're using Prisma's User model
import { Post } from '@prisma/client';  // Assuming you want to return the Post type
import path from 'path';


// Controller to handle creating a post
export const create = async (req: Request, res: Response): Promise<void> => {
  const user = req.user as User;
  const { content } = req.body;

  if (!user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  let imageUrl = null;
  let audioUrl = null;

  if (req.files) {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Handle image upload
    if (files['image']) {
      const imageFile = files['image'][0];
      imageUrl = `/uploads/${imageFile.filename}`;
    }

    console.log(files['gif'])
    // Handle gif upload
    if (files['gif']) {
      const gifFile = files['gif'][0];  // Get the GIF file
      imageUrl = `/uploads/${gifFile.filename}`;  // Store the GIF URL
    }

    // Handle audio upload
    if (files['audio']) {
      const audioFile = files['audio'][0];
      audioUrl = `/uploads/${audioFile.filename}`;
    }
  }

  try {
    const post = await createPost(user.id, content, imageUrl, audioUrl);
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Failed to create post' });
  }
};

// Controller to handle fetching posts with pagination
export const fetchPosts = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1; // Default to page 1 if not provided
  const limit = parseInt(req.query.limit as string) || 10; // Default to 10 items per page

  try {
    const user = req.user as User; // Get the current user from request
    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const postsData = await getPosts(page, limit, user.id); // Pass page, limit, and current user id to get posts from the service
    res.json(postsData); // Send the fetched posts to the client
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
};

// Controller to handle updating a post
// Controller function to update a post by ID
export const update = async (req: Request, res: Response): Promise<void> => {
  const { postId } = req.params;  // Retrieve postId from URL parameters
  const { content } = req.body;   // Retrieve new content from request body

  // Check if content is provided
  if (!content) {
    res.status(400).json({ message: 'Content is required to update the post' });
    return;
  }

  try {
    // Get the user from the request (Assumes authentication middleware sets req.user)
    const user = req.user as { id: number };

    // Call the service function to update the post
    const updatedPost = await updatePost(user.id, Number(postId), content);

    // If the post wasn't found or the user is not the owner, return 403
    if (!updatedPost) {
      res.status(403).json({ message: 'Unauthorized to update this post' });
      return
    }

    // Respond with the updated post
    res.status(200).json(updatedPost);

  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller to delete a post
export const deletePostById = async (req: Request, res: Response): Promise<void> => {
  const { postId } = req.params; // Extract postId from request parameters
  const user = req.user as User; // Assumes authentication middleware sets req.user

  if (!user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const deletedPost = await deletePost(user.id, Number(postId));

    if (!deletedPost) {
      res.status(403).json({ message: 'Unauthorized to delete this post' });
      return;
    }

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};