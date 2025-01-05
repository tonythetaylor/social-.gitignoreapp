import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Feather";

const mockNotifications = [
  {
    id: 1,
    type: "friend_request",
    message: "John Doe sent you a friend request.",
    timestamp: "2022-02-18 14:30",
  },
  {
    id: 2,
    type: "like",
    message: "Jane Doe liked your post.",
    timestamp: "2022-02-18 14:45",
  },
  {
    id: 3,
    type: "comment",
    message: "Alex commented on your photo.",
    timestamp: "2022-02-18 15:00",
  },
  {
    id: 4,
    type: "friend_request",
    message: "Chris Brown sent you a friend request.",
    timestamp: "2022-02-18 15:30",
  },
  {
    id: 5,
    type: "like",
    message: "Sarah liked your post.",
    timestamp: "2022-02-18 16:00",
  },
];

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState(mockNotifications);

  const renderNotification = ({ item }: { item: any }) => {
    let icon;
    switch (item.type) {
      case "friend_request":
        icon = <Icon name="user" size={20} color="green" />; // Changed to a valid icon
        break;
      case "like":
        icon = <Icon name="thumbs-up" size={20} color="blue" />;
        break;
      case "comment":
        icon = <Icon name="message-circle" size={20} color="orange" />;
        break;
      default:
        icon = <Icon name="alert-circle" size={20} color="red" />;
    }

    return (
      <View style={styles.notificationContainer}>
        {icon}
        <Text style={styles.notificationText}>{item.message}</Text>
        <Text style={styles.notificationTime}>{item.timestamp}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.noNotificationsText}>No notifications available.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  notificationContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
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
  noNotificationsText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
});

export default NotificationScreen;