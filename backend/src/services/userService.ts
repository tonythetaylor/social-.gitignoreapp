import prisma from '../models/prismaClient';

export const updateProfilePicture = async (userId: string, profilePicture: string) => {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: parseInt(userId), // Convert string to integer
      },
      data: {
        profilePicture,
      },
    });
    return updatedUser;
  } catch (error) {
    console.error("Error updating profile picture:", error);
    throw new Error("Failed to update profile picture");
  }
};

/**
 * Fetch the user's profile data by ID, including both `friends` and `friendOf`,
 * and their posts (ordered by `createdAt` descending). Also compute a
 * `friendCount` by merging both arrays (unique user IDs).
 */
export const getUserProfileService = async (userId: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        profilePicture: true,
        website: true,
        userID: true,

        // Include user posts
        posts: {
          select: {
            id: true,
            content: true,
            imageUrl: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },

        // Select the "friends" array (users this user is directly connected to)
        friends: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
          },
        },
        // Select the "friendOf" array (users who are connected to this user)
        friendOf: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Merge `friends` + `friendOf` to get a unique set of user IDs
    // This prevents double-counting in a symmetrical self-relation.
    const friendSet = new Set<number>();

    user.friends.forEach((f) => friendSet.add(f.id));
    user.friendOf.forEach((f) => friendSet.add(f.id));

    const friendCount = friendSet.size;

    // Return the user object plus a friendCount property
    return {
      ...user,
      friendCount,
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw new Error("Failed to fetch user data");
  }
};

export const searchUsers = async (searchTerm: string) => {
  try {
    // Search for users by username or userID using the search term
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: searchTerm, mode: "insensitive" } },
          { userID: { contains: searchTerm, mode: "insensitive" } },
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
    console.error("Error searching for users:", error);
    throw new Error("Failed to search for users");
  }
};