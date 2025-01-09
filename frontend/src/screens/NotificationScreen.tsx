import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Modal,
  TouchableOpacity,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { getTimeAgo } from "../utils/getTimeAgo";
import { useTheme } from "../providers/ThemeProvider";

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const { isDark } = useTheme();
  const backendUrl = "http://192.168.1.30:3005";

  // Fetch notifications and friend requests
  const fetchData = async () => {
    const token = await SecureStore.getItemAsync("authToken");
    if (!token) {
      setError("No authentication token found");
      return;
    }
  
    try {
      const [notificationsResponse, friendRequestsResponse] = await Promise.all([
        axios.get(`${backendUrl}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${backendUrl}/friends/notifications/friendRequests`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
  
      // Safely extract notifications data
      const notificationsData = Array.isArray(notificationsResponse.data)
        ? notificationsResponse.data.map((notif: any) => ({
            ...notif,
            type: "notification", // Add a type to differentiate
          }))
        : [];
  
      // Safely extract friend requests data
      const friendRequestsData = Array.isArray(friendRequestsResponse.data)
        ? friendRequestsResponse.data.map((request: any) => ({
            ...request,
            type: "friend_request", // Add a type for friend requests
          }))
        : [];
  
      // Combine and sort notifications
      const allNotifications = [...notificationsData, ...friendRequestsData];
  
      setNotifications(
        allNotifications.sort(
          (a, b) =>
            new Date(b.createdAt || b.timestamp).getTime() - new Date(a.createdAt || a.timestamp).getTime()
        )
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch notifications.");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderNotification = ({ item }: { item: any }) => {
    const hasProfilePicture = item.sender?.profilePicture;
    const icon =
      item.type === "friend_request" ? (
        hasProfilePicture ? (
          <Image source={{ uri: hasProfilePicture }} style={styles.profilePicture} />
        ) : (
          <Icon name="user" size={20} color="green" />
        )
      ) : item.type === "like" ? (
        <Icon name="thumbs-up" size={20} color="blue" />
      ) : item.type === "comment" ? (
        <Icon name="message-circle" size={20} color="orange" />
      ) : (
        <Icon name="bell" size={20} color="red" />
      );
  
    return (
      <View style={[styles.notificationContainer, {
         backgroundColor: isDark ? "#1c1c1c" : "#ffffff",
         shadowColor: isDark  ? "#fff": "#000",
         borderColor: isDark  ? "#fff": "#fff",
         borderWidth: isDark ? 0.5 : 0
         }]}>
        {icon}
        <View style={styles.notificationDetails}>
          <Text style={[styles.notificationText, {color: isDark ? '#fff' : "#333"}]}>{item.message}</Text>
          <Text style={styles.notificationTime}>
            {getTimeAgo(item.createdAt || item.timestamp)}
          </Text>
        </View>
        <View style={styles.postPreview}>
          {item.post?.imageUrl ? (
            <Image
              source={{ uri: `http://192.168.1.30:3005${item.post.imageUrl}` }}
              style={styles.imagePreview}
            />
          ) : item.post?.audioUrl ? (
            <TouchableOpacity onPress={() => console.log("Play audio", item.post.audioUrl)}>
              <Icon name="play-circle" size={30} color="#007bff" />
            </TouchableOpacity>
          ) : item.post?.content ? (
            <Text style={styles.textPreview} numberOfLines={1} ellipsizeMode="tail">
              {item.post.content}
            </Text>
          ) : (
            <Text style={styles.textPreview}>No preview available</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, {
      backgroundColor: isDark ? "#1c1c1c" : "#ffffff"
      }]}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => `${item.id}-${item.type}`}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.noNotificationsText}>No notifications.</Text>}
      />
    </View>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  notificationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  notificationDetails: {
    marginLeft: 10,
    flex: 1,
  },
  notificationText: {
    fontSize: 16,
    color: "#333",
  },
  notificationTime: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  noNotificationsText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 20,
  },
  postPreview: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  imagePreview: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
  textPreview: {
    fontSize: 14,
    color: "#555",
    maxWidth: 100,
  },
  error: {
    color: "red",
    fontSize: 14,
    marginBottom: 12,
  },
});