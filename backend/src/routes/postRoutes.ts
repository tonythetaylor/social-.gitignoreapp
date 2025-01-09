
import { Router } from 'express';
import { create, fetchPosts, update, deletePostById } from '../controllers/postController';
import authenticateJWT from '../middleware/authMiddleware';
import upload from '../utils/multer';

const router = Router();

// Route for creating a post
router.post('/create', authenticateJWT, upload.fields([
  { name: 'image', maxCount: 1 },  // Handle image upload
  { name: 'gif', maxCount: 1 },    // Handle gif upload
  { name: 'audio', maxCount: 1 },    // Handle gif upload
]), create);

// Route for fetching posts with pagination
router.get('/', authenticateJWT, fetchPosts);

// Route for updating a post
router.put('/update/:postId', authenticateJWT, update);

// Route for deleting a post
router.delete('/delete/:postId', authenticateJWT, deletePostById);

export default router;
