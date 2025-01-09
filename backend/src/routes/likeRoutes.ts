// routes/likeRoutes.ts
import { Router } from 'express';
import { like, unlike, getLikes } from '../controllers/likeController';
import authenticateJWT from '../middleware/authMiddleware';

const router = Router();

// Like a post
router.post('/posts/:postId/like', authenticateJWT, like);

// Unlike a post
router.delete('/posts/:postId/unlike', authenticateJWT, unlike);

// Get likes for a post
router.get('/posts/:postId/likes', authenticateJWT, getLikes);

export default router;