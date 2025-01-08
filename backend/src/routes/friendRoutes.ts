
import { Router } from 'express';
import { addFriend, listFriends, checkFriendStatus,getFriendRequests, confirmFriendRequest } from '../controllers/friendController';
import authenticateJWT from '../middleware/authMiddleware';

const router = Router();

router.post('/sendFriendRequest', authenticateJWT, addFriend);
router.post('/checkFriendStatus', authenticateJWT, checkFriendStatus);
router.get('/notifications/friendRequests', authenticateJWT, getFriendRequests);
router.get('/', authenticateJWT, listFriends);
router.post('/confirmRequest', authenticateJWT, confirmFriendRequest);

export default router;
