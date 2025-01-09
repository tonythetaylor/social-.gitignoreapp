// routes/commentRoutes.ts
import { Router } from 'express';
import { createComment, getComments, removeComment } from '../controllers/commentController';
import authenticateJWT from '../middleware/authMiddleware';

const router = Router();

// Add a comment to a post
router.post('/posts/:postId/comments', authenticateJWT, createComment);

// Get comments for a post
router.get('/posts/:postId/comments', authenticateJWT, getComments);

// Delete a comment
router.delete('/comments/:commentId', authenticateJWT, removeComment);

export default router;