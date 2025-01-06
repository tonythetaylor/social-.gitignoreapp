import { Router } from 'express';
import upload from '../utils/multer';
import { getUserProfile, updateUserProfilePicture, searchUsersController } from '../controllers/userController';
import authenticateJWT from '../middleware/authMiddleware';

const router = Router();

router.get('/profile', authenticateJWT, getUserProfile);

// Route to update the user's profile picture
router.post('/update-profile-picture', upload.single('profilePicture'), updateUserProfilePicture);

// Route to search users
router.get('/search', authenticateJWT, searchUsersController);

export default router;