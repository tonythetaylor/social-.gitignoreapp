import React, { useEffect, useState } from 'react';
import { View, Button, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

const PostScreen = () => {
  const [image, setImage] = useState<string | null>(null); // Store image URI
  const [content, setContent] = useState<string>(''); // Store post content

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    };
  
    requestPermissions();
  }, []);

  // Function to launch the image picker
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    // Check if the result was successful and contains 'uri'
    if (!result.canceled && result.assets[0]?.uri) {
      setImage(result.assets[0].uri);  // Save the image URI
    } else {
      console.log("Image picking was canceled or failed.");
    }
  };

  const createPost = async () => {
    const token = await SecureStore.getItemAsync('authToken');
    
    // Ensure there's an image selected
    if (!image) {
      alert('Please pick an image before posting.');
      return;
    }

    // Convert the image URI into a Blob
    const uri = image;
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create FormData and append the image and content
    const formData = new FormData();
    formData.append('image', blob, 'post-image.jpg');
    formData.append('content', content);

    try {
      // Send form data to the server
      const response = await axios.post(`http://192.168.1.30:3005/posts`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View>
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
      <Button title="Pick an Image" onPress={pickImage} />
      <Button title="Create Post" onPress={createPost} />
    </View>
  );
};

export default PostScreen;