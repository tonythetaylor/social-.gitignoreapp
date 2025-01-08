// Function to edit a post
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const apiUrl = "http://192.168.1.30:3005";  // API URL

export const editPost = async (postId: string, newContent: string) => {
  const token = await SecureStore.getItemAsync('authToken');
  
  if (!token) {
    console.error('No token found');
    return { error: 'No token found' };  // Return an error message if no token
  }

  console.log('editPost: ', postId, newContent);

  try {
    const response = await axios.put(
      `${apiUrl}/posts/update/${postId}`,
      { content: newContent },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('Post edited successfully', response.data);

    // Return the updated post data
    return response.data;

  } catch (error: any) {
    console.error('Error editing post:', error);

    // Handle error more gracefully
    if (error.response) {
      // If the server responded with an error
      return { error: error.response.data.message || 'Error updating post' };
    } else if (error.request) {
      // If the request was made but no response was received
      return { error: 'No response from server' };
    } else {
      // If something went wrong with the setup
      return { error: error.message || 'Error updating post' };
    }
  }
};

// Function to delete a post
export const deletePost = async (postId: string) => {
  const token = await SecureStore.getItemAsync('authToken');
  
  if (!token) {
    console.error('No token found');
    return;
  }

  try {
    const response = await axios.delete(`${apiUrl}/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Post deleted successfully', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting post:', error);
    return null;
  }
};

// Function to archive a post
export const archivePost = async (postId: string) => {
  const token = await SecureStore.getItemAsync('authToken');
  
  if (!token) {
    console.error('No token found');
    return;
  }

  try {
    const response = await axios.put(
      `${apiUrl}/posts/${postId}/archive`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log('Post archived successfully', response.data);
    return response.data;
  } catch (error) {
    console.error('Error archiving post:', error);
    return null;
  }
};

// Function to save a post
export const savePost = async (postId: string) => {
  const token = await SecureStore.getItemAsync('authToken');
  
  if (!token) {
    console.error('No token found');
    return;
  }

  try {
    const response = await axios.put(
      `${apiUrl}/posts/${postId}/save`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log('Post saved successfully', response.data);
    return response.data;
  } catch (error) {
    console.error('Error saving post:', error);
    return null;
  }
};