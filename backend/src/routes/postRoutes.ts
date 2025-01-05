
import { Router } from 'express';
import { create, fetchPosts } from '../controllers/postController';
import authenticateJWT from '../middleware/authMiddleware';
import upload from '../utils/multer';

const router = Router();

router.post('/create', authenticateJWT, upload.fields([
    { name: 'image', maxCount: 1 },  // Handle image upload
    { name: 'gif', maxCount: 1 },    // Handle gif upload
]), create);

// router.post('/create', authenticateJWT, upload.single('image'), create);
router.get('/', authenticateJWT, fetchPosts);

export default router;
