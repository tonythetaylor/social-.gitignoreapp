import prisma from '../models/prismaClient';

export const updateProfilePicture = async (userId: string, profilePicture: string) => {
    try {
      const updatedUser = await prisma.user.update({
        where: {
          id: parseInt(userId),  // Convert string to integer
        },
        data: {
          profilePicture,
        },
      });
      return updatedUser;
    } catch (error) {
      console.error('Error updating profile picture:', error);
      throw new Error('Failed to update profile picture');
    }
  };

export const getUserProfileService = async (userId: number) => {
    try {
        // Fetch user details by id from the database
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {  // Select specific fields to return
                id: true,
                username: true,
                email: true,
                bio: true,
                profilePicture: true,
                website: true,
                userID: true,
                posts: { // Include user's posts
                    select: {
                        id: true,
                        content: true,
                        imageUrl: true,
                        createdAt: true,
                    },
                    orderBy: {
                        createdAt: 'desc', // Order posts by creation date in descending order (newest first)
                    }
                },
            },
        });

        // If the user is not found, throw an error
        if (!user) {
            throw new Error('User not found');
        }

        return user;
    } catch (error) {
        throw new Error('Failed to fetch user data');
    }
};

export const searchUsers = async (searchTerm: string) => {
  try {
    // Search for users by username or userID using the search term
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: searchTerm, mode: 'insensitive' } },
          { userID: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        profilePicture: true,
        userID: true,
      },
    });

    return users;
  } catch (error) {
    throw new Error('Failed to search for users');
  }
};