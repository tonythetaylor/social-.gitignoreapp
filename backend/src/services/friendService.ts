
import prisma from '../models/prismaClient';

export const sendFriendRequest = async (senderId: number, receiverId: number) => {
  return prisma.friendRequest.create({
    data: {
      senderId,
      receiverId,
      status: 'pending',
    },
  });
};

export const getFriends = async (userId: number) => {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      friends: true,
    },
  });
};
