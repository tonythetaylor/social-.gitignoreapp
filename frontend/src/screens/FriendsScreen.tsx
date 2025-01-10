// src/screens/FriendsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const apiUrl = process.env.REACT_APP_API_URL;

const FriendsScreen = () => {
  const [friends, setFriends] = useState<any[]>([]);

  useEffect(() => {
    const getFriends = async () => {
      const token = await SecureStore.getItemAsync('authToken');
      const response = await axios.get(`http://192.168.1.174:3005/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriends(response.data);
    };
    getFriends();
  }, []);

  const sendFriendRequest = async (userId: number) => {
    const token = await SecureStore.getItemAsync('authToken');
    await axios.post(
        `http://192.168.1.174:3005/friend-request`,
      { userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  return (
    <View>
      {friends.map((friend) => (
        <View key={friend.id}>
          <Text>{friend.username}</Text>
          <Button title="Send Friend Request" onPress={() => sendFriendRequest(friend.id)} />
        </View>
      ))}
    </View>
  );
};

export default FriendsScreen;