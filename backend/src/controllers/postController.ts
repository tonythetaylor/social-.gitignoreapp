import { Request, Response } from 'express';
import { createPost, getPosts, updatePost } from '../services/postService';
import { User } from '@prisma/client';  // Assuming you're using Prisma's User model
import { Post } from '@prisma/client';  // Assuming you want to return the Post type
import path from 'path';

// Controller to handle creating a post
export const create = async (req: Request, res: Response): Promise<void> => {
  const user = req.user as User;  // Explicit cast to User type
  const { content } = req.body;
  if (!user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  // Handle image and GIF upload
  let imageUrl = null;
  let gifUrl = null;

  if (req.files) {
    // Assert that req.files is the object type with field names
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  
    // Handle image upload
    if (files['image']) {
      const imageFile = files['image'][0];  // Get the image file
      imageUrl = `/uploads/${imageFile.filename}`;  // Store the image URL
    }
  
    // Handle gif upload
    if (files['gif']) {
      const gifFile = files['gif'][0];  // Get the GIF file
      imageUrl = `/uploads/${gifFile.filename}`;  // Store the GIF URL
    }
  }

  
  // Handle image URL from file upload
  // const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; // Full URL path
  // console.log("fileType uploaded:",req.body);

  // // Optional: Check if the uploaded file is a GIF or an image
  // const fileType = req.file ? path.extname(req.file.originalname).toLowerCase() : null;
  // console.log("fileType uploaded:", fileType);

  // // If it's a GIF, log it to confirm
  // if (fileType === '.gif') {
  //   console.log("GIF uploaded:", req.file?.filename);
  // }

  try {
    // Create the post in the database
    const post: Post = await createPost(user.id, content, imageUrl); // Pass user.id, content, and imageUrl
    res.status(201).json(post);  // Return the created post
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Controller to handle fetching posts with pagination
export const fetchPosts = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1; // Default to page 1 if not provided
  const limit = parseInt(req.query.limit as string) || 10; // Default to 10 items per page

  try {
    const postsData = await getPosts(page, limit); // Pass page and limit to get posts from the service
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