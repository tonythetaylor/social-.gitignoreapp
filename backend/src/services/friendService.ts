import prisma from '../models/prismaClient';

/**
 * Send a friend request from one user (senderId) to another (receiverId).
 * Throws an error if a pending/accepted request already exists.
 */
export const sendFriendRequest = async (senderId: number, receiverId: number) => {
  // Check if already friends or if a request (pending/accepted) exists
  const existingRequest = await prisma.friendRequest.findFirst({
    where: {
      senderId,
      receiverId,
      OR: [
        { status: 'pending' },
        { status: 'accepted' },
      ],
    },
  });

  if (existingRequest) {
    throw new Error('A friend request has already been sent or you are already friends.');
  }

  return prisma.friendRequest.create({
    data: {
      senderId,
      receiverId,
      status: 'pending',
    },
  });
};

/**
 * Retrieve the user's info, including their friends array,
 * for a given userId. Adjust as needed for your front-end.
 */
export const getFriends = async (userId: number) => {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      // If your schema has a self-relation for friends, e.g.:
      // friends: User[] @relation("UserFriends")
      friends: true,
    },
  });
};

/**
 * Check if two users are already friends. Returns `true` if a friendRequest
 * with status 'accepted' exists in either direction, otherwise false.
 */
export const checkIfAlreadyFriends = async (userId: number, otherUserId: number) => {
  try {
    const friendStatus = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
        status: 'accepted',
      },
    });
    return friendStatus !== null;
  } catch (error) {
    console.error('Error checking friend status:', error);
    throw new Error('Error checking friend status.');
  }
};

/**
 * Get a list of pending friend requests for a given user (the receiver).
 */
export const getFriendRequestsForUser = async (userId: number) => {
  const friendRequests = await prisma.friendRequest.findMany({
    where: {
      receiverId: userId,
      status: 'pending',
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          profilePicture: true,
        },
      },
    },
  });

  // Transform the raw friendRequest objects into a more convenient shape
  return friendRequests.map((request) => ({
    id: request.id,
    senderId: request.senderId,
    senderUsername: request.sender.username,
    senderProfilePicture: request.sender.profilePicture,
    message: `${request.sender.username} sent you a friend request.`,
    timestamp: request.createdAt ? request.createdAt.toISOString() : null,
    type: 'friend_request',
  }));
};

/**
 * Confirm (accept) an existing friend request. Updates status to 'accepted',
 * and creates mutual Follow records.
 */
export const confirmFriendRequest = async (
  requestId: number,
  receiverId: number,
  chatEnabled?: boolean,
  videoEnabled?: boolean,
  feedEnabled?: boolean
) => {
  // 1. Find the friend request to ensure it exists and belongs to the user
  const friendRequest = await prisma.friendRequest.findUnique({
    where: { id: requestId },
  });

  if (!friendRequest) {
    throw new Error('Friend request not found.');
  }

  // 2. Check that the user is the receiver
  if (friendRequest.receiverId !== receiverId) {
    throw new Error('Unauthorized. You are not the receiver of this request.');
  }

  // 3. Check if it's still pending
  if (friendRequest.status !== 'pending') {
    throw new Error('This friend request is no longer pending.');
  }

  // 4. Update the request status to 'accepted'
  const updatedRequest = await prisma.friendRequest.update({
    where: { id: requestId },
    data: {
      status: 'accepted',
      chatEnabled,
      videoEnabled,
      feedEnabled,
    },
  });

  // 5. Create mutual Follow records
  // a. Sender follows Receiver
  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: friendRequest.senderId,
        followingId: friendRequest.receiverId,
      },
    },
    update: {
      status: 'accepted',
    },
    create: {
      followerId: friendRequest.senderId,
      followingId: friendRequest.receiverId,
      status: 'accepted',
    },
  });

  // b. Receiver follows Sender
  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: friendRequest.receiverId,
        followingId: friendRequest.senderId,
      },
    },
    update: {
      status: 'accepted',
    },
    create: {
      followerId: friendRequest.receiverId,
      followingId: friendRequest.senderId,
      status: 'accepted',
    },
  });

  // 6. Optionally, update the mutual friendship (if using the self-relation)
  await prisma.user.update({
    where: { id: friendRequest.receiverId },
    data: {
      friends: {
        connect: { id: friendRequest.senderId },
      },
    },
  });

  await prisma.user.update({
    where: { id: friendRequest.senderId },
    data: {
      friends: {
        connect: { id: friendRequest.receiverId },
      },
    },
  });

  return updatedRequest;
};