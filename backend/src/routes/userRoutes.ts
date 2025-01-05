import { Router } from 'express';
import upload from '../utils/multer';  // Assuming you have the multer setup
import { getUserProfile, updateUserProfilePicture } from '../controllers/userController';
import authenticateJWT from '../middleware/authMiddleware';

const router = Router();

router.get('/profile', authenticateJWT, getUserProfile);

// Route to update the user's profile picture
router.post('/update-profile-picture', upload.single('profilePicture'), updateUserProfilePicture);


export default router;