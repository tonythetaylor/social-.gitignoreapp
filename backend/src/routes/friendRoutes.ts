
import { Router } from 'express';
import { addFriend, listFriends } from '../controllers/friendController';
import authenticateJWT from '../middleware/authMiddleware';

const router = Router();

router.post('/add', authenticateJWT, addFriend);
router.get('/', authenticateJWT, listFriends);

export default router;
