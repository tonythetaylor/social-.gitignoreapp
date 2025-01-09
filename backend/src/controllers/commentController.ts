// controllers/commentController.ts
import { Request, Response } from 'express';
import { addComment, getCommentsForPost, deleteComment } from '../services/commentService';
import { User } from '@prisma/client';

export const createComment = async (req: Request, res: Response): Promise<void> => {
    const user = req.user as User;
    const { postId } = req.params;
    const { content } = req.body;
  
    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
  
    let audioUrl = null;
  
    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  
      // Handle audio upload
      if (files['audio']) {
        const audioFile = files['audio'][0];
        audioUrl = `/uploads/${audioFile.filename}`;
      }
    }
  
    try {
      const comment = await addComment(user.id, parseInt(postId), content, audioUrl);
      res.status(201).json(comment);
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({ message: 'Failed to add comment' });
    }
  };

export const getComments = async (req: Request, res: Response): Promise<void> => {
  const { postId } = req.params;

  try {
    const comments = await getCommentsForPost(parseInt(postId));
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
};

export const removeComment = async (req: Request, res: Response): Promise<void> => {
  const user = req.user as User;
  const { commentId } = req.params;

  if (!user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const deletedComment = await deleteComment(parseInt(commentId), user.id);
    if (!deletedComment) {
      res.status(403).json({ message: 'Unauthorized to delete this comment' });
      return;
    }
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
};