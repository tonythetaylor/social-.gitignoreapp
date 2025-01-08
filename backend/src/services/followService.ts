// src/services/followService.ts

import prisma from "../models/prismaClient";

/**
 * Get users who follow the current user.
 */
export const getFollowers = async (userId: number) => {
  return prisma.follow.findMany({
    where: {
      followingId: userId,
      status: "accepted",
    },
    include: {
      follower: {
        select: {
          id: true,
          username: true,
          profilePicture: true,
          userID: true,
        },
      },
    },
  });
};

/**
 * Get users whom the current user is following.
 */
export const getFollowing = async (userId: number) => {
  return prisma.follow.findMany({
    where: {
      followerId: userId,
      status: "accepted",
    },
    include: {
      following: {
        select: {
          id: true,
          username: true,
          profilePicture: true,
          userID: true,
        },
      },
    },
  });
};

/**
 * Get pending follow requests for the current user.
 */
export const getPendingFollows = async (userId: number) => {
  return prisma.follow.findMany({
    where: {
      followingId: userId,
      status: "pending",
    },
    include: {
      follower: {
        select: {
          id: true,
          username: true,
          profilePicture: true,
          userID: true,
        },
      },
    },
  });
};

/**
 * Send a follow request from the current user to target user.
 */
export const sendFollowRequest = async (followerId: number, followingId: number) => {
  // Prevent users from following themselves
  if (followerId === followingId) {
    throw new Error("You cannot follow yourself.");
  }

  // Check if a follow already exists
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  if (existingFollow) {
    if (existingFollow.status === "accepted") {
      throw new Error("You are already following this user.");
    } else if (existingFollow.status === "pending") {
      throw new Error("You have already sent a follow request to this user.");
    } else if (existingFollow.status === "rejected") {
      // Optionally, allow resending a follow request if previously rejected
      return prisma.follow.update({
        where: {
          id: existingFollow.id,
        },
        data: {
          status: "pending",
        },
      });
    }
  }

  // Create a new follow request with status 'pending'
  return prisma.follow.create({
    data: {
      followerId,
      followingId,
      status: "pending",
    },
  });
};

/**
 * Unfollow a user.
 */
export const unfollowUser = async (followerId: number, followingId: number) => {
  // Check if the follow exists and is accepted
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  if (!existingFollow || existingFollow.status !== "accepted") {
    throw new Error("You are not following this user.");
  }

  // Delete the follow record
  return prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });
};

/**
 * Accept a pending follow request.
 */
export const acceptFollowRequest = async (followId: number, userId: number) => {
  // Verify that the follow request exists and is pending
  const follow = await prisma.follow.findUnique({
    where: { id: followId },
  });

  if (!follow) {
    throw new Error("Follow request not found.");
  }

  if (follow.followingId !== userId) {
    throw new Error("You are not authorized to accept this follow request.");
  }

  if (follow.status !== "pending") {
    throw new Error("Follow request is not pending.");
  }

  // Update the status to 'accepted'
  return prisma.follow.update({
    where: { id: followId },
    data: { status: "accepted" },
  });
};

/**
 * Reject a pending follow request.
 */
export const rejectFollowRequest = async (followId: number, userId: number) => {
  // Verify that the follow request exists and is pending
  const follow = await prisma.follow.findUnique({
    where: { id: followId },
  });

  if (!follow) {
    throw new Error("Follow request not found.");
  }

  if (follow.followingId !== userId) {
    throw new Error("You are not authorized to reject this follow request.");
  }

  if (follow.status !== "pending") {
    throw new Error("Follow request is not pending.");
  }

  // Update the status to 'rejected'
  return prisma.follow.update({
    where: { id: followId },
    data: { status: "rejected" },
  });
};