import { Request, Response } from 'express';
import { likePost, unlikePost, getPostLikes, isPostLikedByUser } from '../services/likeService';
import { User } from '@prisma/client';

export const like = async (req: Request, res: Response): Promise<void> => {
  const user = req.user as User;
  const { postId } = req.params;

  if (!user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    // Check if already liked
    const alreadyLiked = await isPostLikedByUser(user.id, parseInt(postId));
    if (alreadyLiked) {
      res.status(400).json({ message: 'Post already liked' });
      return;
    }

    const like = await likePost(user.id, parseInt(postId));
    res.status(201).json(like);
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Failed to like post' });
  }
};

export const unlike = async (req: Request, res: Response): Promise<void> => {
  const user = req.user as User;
  const { postId } = req.params;

  if (!user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const like = await unlikePost(user.id, parseInt(postId));
    if (!like) {
      res.status(404).json({ message: 'Like not found' });
      return;
    }
    res.status(200).json({ message: 'Post unliked successfully' });
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({ message: 'Failed to unlike post' });
  }
};

export const getLikes = async (req: Request, res: Response): Promise<void> => {
  const { postId } = req.params;

  try {
    const likes = await getPostLikes(parseInt(postId));
    res.status(200).json(likes);
  } catch (error) {
    console.error('Error fetching likes:', error);
    res.status(500).json({ message: 'Failed to fetch likes' });
  }
};