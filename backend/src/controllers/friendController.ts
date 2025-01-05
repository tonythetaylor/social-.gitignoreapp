import { Request, Response } from 'express';
import { sendFriendRequest, getFriends } from '../services/friendService';

export const addFriend = async (req: Request, res: Response) => {
  // Check if req.user is undefined
  if (!req.user) {
     res.status(401).json({ message: 'Unauthorized' });
     return
  }

  const { userId } = req.body;
  try {
    // Proceed if req.user is defined
    const friendRequest = await sendFriendRequest(req.user.id, userId);
    res.status(201).json(friendRequest);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const listFriends = async (req: Request, res: Response) => {
  // Check if req.user is undefined
  if (!req.user) {
     res.status(401).json({ message: 'Unauthorized' });
     return
  }

  try {
    // Proceed if req.user is defined
    const friends = await getFriends(req.user.id);
    res.json(friends);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};