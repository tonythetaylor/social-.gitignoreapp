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
import * as SecureStore from "expo-secure-store"; // SecureStore to get token
import { getTimeAgo } from "../utils/getTimeAgo"; // Assuming you have a utility for time formatting

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  // Access toggles
  const [chatEnabled, setChatEnabled] = useState<boolean>(false);
  const [videoEnabled, setVideoEnabled] = useState<boolean>(false);
  const [feedEnabled, setFeedEnabled] = useState<boolean>(false);

  const backendUrl = "http://192.168.1.30:3005"; // Adjust to your environment

  // Fetch friend requests from the backend
  const fetchFriendRequests = async () => {
    const token = await SecureStore.getItemAsync("authToken");

    if (!token) {
      setError("No authentication token found");
      return;
    }

    try {
      const response = await axios.get(
        `${backendUrl}/friends/notifications/friendRequests`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data && response.data.length > 0) {
        setNotifications(response.data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      setError("Failed to fetch friend requests.");
    }
  };

  // Fetch notifications when component mounts or when user pulls to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchFriendRequests()
      .then(() => setRefreshing(false))
      .catch(() => setRefreshing(false));
  };

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  // Renders each notification (friend request or otherwise)
  const renderNotification = ({ item }: { item: any }) => {
    // Show either the sender's profile picture or a user icon
    const hasProfilePicture = item.senderProfilePicture;
    let icon;
    if (item.type === "friend_request") {
      icon = hasProfilePicture ? (
        <Image source={{ uri: item.senderProfilePicture }} style={styles.profilePicture} />
      ) : (
        <Icon name="user" size={20} color="green" />
      );
    } else {
      // Example handling for other notification types
      switch (item.type) {
        case "like":
          icon = <Icon name="thumbs-up" size={20} color="blue" />;
          break;
        case "comment":
          icon = <Icon name="message-circle" size={20} color="orange" />;
          break;
        default:
          icon = <Icon name="alert-circle" size={20} color="red" />;
      }
    }

    return (
      <TouchableOpacity
        onPress={() => {
          // For friend requests, open the modal
          if (item.type === "friend_request") {
            setSelectedNotification(item);
            // Reset toggles for each new request
            setChatEnabled(false);
            setVideoEnabled(false);
            setFeedEnabled(false);
            setModalVisible(true);
          }
        }}
      >
        <View style={styles.notificationContainer}>
          {icon}
          <Text style={styles.notificationText}>{item.message}</Text>
          <Text style={styles.notificationTime}>{getTimeAgo(item.timestamp)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Close the modal and reset
  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedNotification(null);
  };

  // Toggle functions
  const toggleChatAccess = () => setChatEnabled((prev) => !prev);
  const toggleVideoAccess = () => setVideoEnabled((prev) => !prev);
  const toggleFeedAccess = () => setFeedEnabled((prev) => !prev);

  // Confirm friend request with the chosen access settings
  const handleConfirmAction = async () => {
    if (!selectedNotification) return;

    console.log("Confirming friend request ID:", selectedNotification.id);
    console.log("Chat Access:", chatEnabled);
    console.log("Video Access:", videoEnabled);
    console.log("Feed Access:", feedEnabled);

    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      // Make a POST (or PUT) request to confirm the friend request
      await axios.post(
        `${backendUrl}/friends/confirmRequest`, // Example route
        {
          requestId: selectedNotification.id,
          chatEnabled: chatEnabled,
          videoEnabled: videoEnabled,
          feedEnabled: feedEnabled,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // On success, refresh the list of notifications
      fetchFriendRequests();
    } catch (err) {
      console.error("Error confirming friend request:", err);
      setError("Failed to confirm friend request.");
    } finally {
      // Hide modal
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.noNotificationsText}>No friend requests.</Text>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4caf50"]}
          />
        }
      />

      {/* Friend Request Modal */}
      {selectedNotification && (
        <Modal
          visible={modalVisible}
          animationType="fade"
          onRequestClose={handleModalClose}
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                Friend Request from {selectedNotification.senderUsername}
              </Text>
              <Text style={styles.modalMessage}>{selectedNotification.message}</Text>

              {/* Access Toggles */}
              <View style={styles.modalOptions}>
                <TouchableOpacity
                  style={[styles.optionButton, chatEnabled && styles.optionButtonEnabled]}
                  onPress={toggleChatAccess}
                >
                  <Text>Chat Access {chatEnabled ? "(Enabled)" : "(Disabled)"}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionButton, videoEnabled && styles.optionButtonEnabled]}
                  onPress={toggleVideoAccess}
                >
                  <Text>Video Access {videoEnabled ? "(Enabled)" : "(Disabled)"}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionButton, feedEnabled && styles.optionButtonEnabled]}
                  onPress={toggleFeedAccess}
                >
                  <Text>Feed Access {feedEnabled ? "(Enabled)" : "(Disabled)"}</Text>
                </TouchableOpacity>
              </View>

              {/* Confirm Button */}
              <TouchableOpacity onPress={handleConfirmAction} style={styles.confirmButton}>
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>

              {/* Close Button */}
              <TouchableOpacity onPress={handleModalClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default NotificationScreen;

// ---- STYLES ----
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  notificationContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
  },
  notificationText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
    flex: 1,
  },
  notificationTime: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  profilePicture: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  noNotificationsText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  error: {
    color: "red",
    fontSize: 14,
    marginBottom: 12,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#555",
  },
  modalOptions: {
    width: "100%",
    marginBottom: 20,
  },
  optionButton: {
    padding: 12,
    backgroundColor: "#f4f4f4",
    marginBottom: 10,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  optionButtonEnabled: {
    backgroundColor: "#4caf50",
    borderColor: "#4caf50",
  },
  confirmButton: {
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    marginBottom: 10,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: "#f44336",
    padding: 10,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});