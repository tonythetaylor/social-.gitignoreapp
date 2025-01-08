import { Request, Response } from 'express';
import {
  sendFriendRequest, getFriends, checkIfAlreadyFriends, getFriendRequestsForUser, confirmFriendRequest as confirmFriendRequestService, // <-- import the service
} from '../services/friendService';

export const addFriend = async (req: Request, res: Response) => {
  // Check if req.user is undefined
  if (!req.user || typeof req.user.id !== 'number') {
    res.status(401).json({ message: 'Unauthorized' });
    return
  }

  const { userID } = req.body;
  console.log(userID);

  try {
    // Proceed if req.user is defined and id is valid
    const friendRequest = await sendFriendRequest(req.user.id, userID);
    res.status(201).json(friendRequest);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const listFriends = async (req: Request, res: Response) => {
  // Check if req.user is undefined
  if (!req.user || typeof req.user.id !== 'number') {
    res.status(401).json({ message: 'Unauthorized' });
    return
  }

  try {
    // Proceed if req.user is defined and id is valid
    const friends = await getFriends(req.user.id);
    res.json(friends);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Check if the users are friends
export const checkFriendStatus = async (req: Request, res: Response) => {
  if (!req.user || typeof req.user.id !== 'number') {
    res.status(401).json({ message: "Unauthorized" });
    return
  }

  const { userId } = req.body;  // Ensure userId is being passed in the request body
  try {
    // Check if the users are friends (implement logic to check friendship)
    const isFriend = await checkIfAlreadyFriends(req.user.id, userId);
    res.json({ isFriend });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Fetch friend requests for the logged-in user
export const getFriendRequests = async (req: Request, res: Response) => {
  try {
    const userId = req?.user?.id;  // Assuming userId is in req.user
    if (!userId) {
      res.status(400).json({ message: 'User not authenticated.' });
      return;
    }

    const friendRequests = await getFriendRequestsForUser(userId);

    // If there are no friend requests, return an empty array with a 200 status code
    if (friendRequests.length > 0) {
      res.status(200).json(friendRequests);
    } else {
      res.status(200).json({ message: 'No friend requests found.', data: [] }); // Return empty data array with a 200 response
    }
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    res.status(500).json({ message: 'Failed to fetch friend requests.' });
  }
};

export const confirmFriendRequest = async (req: Request, res: Response) => {
  if (!req.user || typeof req.user.id !== 'number') {
    res.status(401).json({ message: 'Unauthorized' });
    return
  }

  const { requestId, chatEnabled, videoEnabled, feedEnabled } = req.body;
  const receiverId = req.user.id;

  try {
    const updatedRequest = await confirmFriendRequestService(
      requestId,
      receiverId,
      chatEnabled,
      videoEnabled,
      feedEnabled
    );

     res.status(200).json({
      message: 'Friend request accepted successfully.',
      data: updatedRequest,
    });
    return
  } catch (error) {
    console.error('Error confirming friend request:', error);
    res.status(500).json({ message: (error as Error).message });
    return
  }
};