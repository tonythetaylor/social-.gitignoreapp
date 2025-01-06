// userController.ts
import { Request, Response } from 'express';
import { updateProfilePicture, getUserProfileService, searchUsers } from '../services/userService';

export const updateUserProfilePicture = async (req: Request, res: Response) => {
    const { userId } = req.body; // Retrieve userId from the request body
    console.log(req.body)
    const filePath = req.file ? `http://10.0.0.151:3005/uploads/${req.file.filename}` : null;

  if (!filePath) {
     res.status(400).json({ error: 'No image file uploaded' });
     return
  }

  try {
    if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
      return
    }

    const updatedUser = await updateProfilePicture(userId, filePath);
     res.status(200).json({
      message: 'Profile picture updated successfully',
      user: updatedUser,
    });
    return
  } catch (error) {
    console.error('Error updating profile picture:', (error as Error).message);
     res.status(500).json({ error: 'Failed to update profile picture' });
     return
  }
};

// Controller to get the user profile
export const getUserProfile = async (req: Request, res: Response) => {
    const userId = req.user?.id;  // Access the user id from the JWT token
  
    // If userId is not available, return an error
    if (!userId) {
       res.status(403).json({ error: 'User not found or unauthorized' });
       return
    }
  
    try {
      // Fetch user profile by calling the service
      const user = await getUserProfileService(userId);
      
      // Send user profile data as a response
      res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ error: 'Failed to fetch user data' });
    }
  };

  // Controller function for searching users
export const searchUsersController = async (req: Request, res: Response) => {
  const { searchTerm } = req.query;  // Get search term from query params

  if (!searchTerm) {
    res.status(400).json({ error: 'Search term is required' });
    return
  }

  try {
    const users = await searchUsers(searchTerm as string);  // Call the service function

    // Return the search results
    res.status(200).json(users);
  } catch (error) {
    console.error('Error searching for users:', error);
    res.status(500).json({ error: 'Failed to search for users' });
  }
};