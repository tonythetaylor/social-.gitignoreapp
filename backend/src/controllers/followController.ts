// src/controllers/followController.ts

import { Request, Response } from "express";
import {
  getFollowers,
  getFollowing,
  getPendingFollows,
  sendFollowRequest,
  unfollowUser,
  acceptFollowRequest,
  rejectFollowRequest,
} from "../services/followService";

/**
 * Get followers of the current user.
 */
export const fetchFollowers = async (req: Request, res: Response) => {
  try {
    const userId = req?.user?.id as any;
    console.log('fetchFollowers: ', req.user?.id)
    const followers = await getFollowers(userId);
    console.log('fetchFollowers: ', followers)

    res.json(followers);
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ message: "Failed to fetch followers." });
  }
};

/**
 * Get users the current user is following.
 */
export const fetchFollowing = async (req: Request, res: Response) => {
  try {
    const userId = req?.user?.id as any;
    const following = await getFollowing(userId);
    res.json(following);
  } catch (error) {
    console.error("Error fetching following:", error);
    res.status(500).json({ message: "Failed to fetch following." });
  }
};

/**
 * Get pending follow requests for the current user.
 */
export const fetchPendingFollows = async (req: Request, res: Response) => {
  try {
    const userId = req?.user?.id as any;
    const pendingFollows = await getPendingFollows(userId);
    res.json(pendingFollows);
  } catch (error) {
    console.error("Error fetching pending follows:", error);
    res.status(500).json({ message: "Failed to fetch pending follows." });
  }
};

/**
 * Send a follow request.
 */
export const followUser = async (req: Request, res: Response) => {
  try {
    const followerId = req?.user?.id as any;
    const { targetUserId } = req.body;

    if (!targetUserId) {
       res.status(400).json({ message: "Target user ID is required." });
    }

    const newFollow = await sendFollowRequest(followerId, targetUserId);
    res.status(201).json(newFollow);
  } catch (error) {
    console.error("Error sending follow request:", error);
    res.status(400).json({ message: (error as Error).message });
  }
};

/**
 * Unfollow a user.
 */
export const unfollow = async (req: Request, res: Response) => {
  try {
    const followerId = req?.user?.id as any;
    const { followingId } = req.params;

    if (!followingId) {
       res.status(400).json({ message: "Following user ID is required." });
    }

    await unfollowUser(followerId, Number(followingId));
    res.json({ message: "Successfully unfollowed the user." });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(400).json({ message: (error as Error).message });
  }
};

/**
 * Accept a follow request.
 */
export const acceptFollow = async (req: Request, res: Response) => {
  try {
    const userId = req?.user?.id as any;
    const { followId } = req.params;

    if (!followId) {
       res.status(400).json({ message: "Follow ID is required." });
    }

    const updatedFollow = await acceptFollowRequest(Number(followId), userId);
    res.json(updatedFollow);
  } catch (error) {
    console.error("Error accepting follow request:", error);
    res.status(400).json({ message: (error as Error).message });
  }
};

/**
 * Reject a follow request.
 */
export const rejectFollow = async (req: Request, res: Response) => {
  try {
    const userId = req?.user?.id as any;
    const { followId } = req.params;

    if (!followId) {
       res.status(400).json({ message: "Follow ID is required." });
    }

    const updatedFollow = await rejectFollowRequest(Number(followId), userId);
    res.json(updatedFollow);
  } catch (error) {
    console.error("Error rejecting follow request:", error);
    res.status(400).json({ message: (error as Error).message });
  }
};