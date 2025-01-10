import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import debounce from "lodash/debounce";
import { BlurView } from "expo-blur";
import {
  useTheme,
  LightTheme,
  DarkThemeConfig,
} from "../providers/ThemeProvider";

const SearchScreen = ({ navigation }: any) => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [expandedUserID, setExpandedUserID] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedUserID, setSelectedUserID] = useState<string | null>(null);

  const [isCallEnabled, setIsCallEnabled] = useState(true);
  const [isMessageEnabled, setIsMessageEnabled] = useState(true);
  const { isDark } = useTheme();

  // Debounced search function
  const handleSearch = debounce(async () => {
    if (query.length > 0) {
      try {
        const token = await SecureStore.getItemAsync("authToken");
        if (!token) {
          setError("No authentication token found");
          return;
        }
        const response = await axios.get(
          `http://192.168.1.174:3005/user/search?searchTerm=${query}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data && response.data.length > 0) {
          setSearchResults(response.data);
        } else {
          setError("No users found");
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Search error: ", error);
        setError("Search failed. Please try again.");
      }
    } else {
      setSearchResults([]);
      setError("");
    }
  }, 500);

  const handleQueryChange = (text: string) => {
    setQuery(text);
  };

  const handleSearchButtonClick = () => {
    handleSearch();
  };

  const handleClearInput = () => {
    setQuery("");
    setSearchResults([]);
    setError("");
  };

  const handleSearchSubmit = () => {
    handleSearch();
  };

  const toggleActions = (userID: string) => {
    if (expandedUserID === userID) {
      setExpandedUserID(null);
      setModalVisible(false);
    } else {
      setExpandedUserID(userID);
      setSelectedUserID(userID);
      setModalVisible(true);
    }
  };

  const toggleCallFeature = () => {
    setIsCallEnabled(!isCallEnabled);
  };

  const toggleMessageFeature = () => {
    setIsMessageEnabled(!isMessageEnabled);
  };

  const checkIfAlreadyFriends = async (selectedUserID: string) => {
    try {
      const token = await SecureStore.getItemAsync("authToken");

      if (!token) {
        setError("No authentication token found");
        return false;
      }

      const response = await axios.post(
        `http://192.168.1.174:3005/friends/checkFriendStatus`,
        { userId: selectedUserID },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { isFriend } = response.data;
      console.log("DEBUG: ", response.data);
      return isFriend;
    } catch (error) {
      console.error("Error checking friend status:", error);
      setError("Failed to check friendship status.");
      return false;
    }
  };

  const handleSendFriendRequest = async (selectedUserID: any) => {
    const token = await SecureStore.getItemAsync("authToken");

    if (!token) {
      setError("No authentication token found");
      return;
    }

    console.log("selectedUserID -> ", selectedUserID);

    if (!selectedUserID) {
      setError("No user selected");
      return;
    }

    // Check if the user is already friends
    const isAlreadyFriends = await checkIfAlreadyFriends(selectedUserID);

    // If already friends, stop further execution
    if (isAlreadyFriends) {
      alert("You are already friends with this user.");
      return;
    }

    // Proceed with sending the friend request if they are not friends yet
    try {
      const response = await axios.post(
        `http://192.168.1.174:3005/friends/sendFriendRequest`,
        { userID: selectedUserID },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Friend request sent successfully.");
      setModalVisible(false); // Close the modal after sending the request
    } catch (error) {
      console.error("Error sending friend request: ", error);
      alert("Failed to send friend request.");
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.userContainer}>
      <Image
        source={{
          uri: item.profilePicture || "https://via.placeholder.com/150",
        }}
        style={styles.profileImage}
      />
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.userID}>{item.userID}</Text>
      </View>

      <View style={styles.iconsContainer}>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="phone" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="message-circle" size={24} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleSendFriendRequest(item.id)}
        >
          <Icon name="user-plus" size={24} color="#FFC107" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => toggleActions(item.userID)}
        style={styles.ellipsisButton}
      >
        <Icon name="more-vertical" size={24} color="#000" />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible && selectedUserID === item.userID}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <BlurView intensity={50} style={styles.modalBlurBackground}>
              <View style={styles.modalContainer}>
                <View style={styles.userCardHeader}>
                  <Image
                    source={{
                      uri:
                        item.profilePicture ||
                        "https://via.placeholder.com/150",
                    }}
                    style={styles.modalProfileImage}
                  />
                  <Text style={styles.modalUsername}>{item.username}</Text>
                </View>

                <View style={styles.toggleButtonsContainer}>
                  <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={toggleCallFeature}
                  >
                    <Icon
                      name={isCallEnabled ? "phone" : "phone-off"}
                      size={24}
                      color={isCallEnabled ? "#4CAF50" : "#B0B0B0"}
                    />
                    <Text style={styles.toggleText}>
                      {isCallEnabled ? "Call Enabled" : "Call Disabled"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={toggleMessageFeature}
                  >
                    <Icon
                      name={
                        isMessageEnabled ? "message-circle" : "message-square"
                      }
                      size={24}
                      color={isMessageEnabled ? "#2196F3" : "#B0B0B0"}
                    />
                    <Text style={styles.toggleText}>
                      {isMessageEnabled
                        ? "Message Enabled"
                        : "Message Disabled"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.separator} />

                <FlatList
                  data={[
                    { title: "Mute", icon: "volume-x", color: "#FF9800" },
                    { title: "Block", icon: "slash", color: "#f44336" },
                    { title: "Report", icon: "flag", color: "#2196F3" },
                  ]}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalActionButton}
                      onPress={() => alert(`${item.title} clicked`)}
                    >
                      <Icon name={item.icon} size={18} color={item.color} />
                      <Text style={styles.modalActionText}>{item.title}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.title}
                />
              </View>
            </BlurView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#1c1c1c" : LightTheme.colors.background },
      ]}
      behavior="padding"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <View style={styles.searchContainer}>
            <TextInput
              style={[
                styles.searchInput,
                { color: isDark ? "#ffffff" : "#000000" }, // Dynamic text color
              ]}
              placeholder="Search by userID or username"
              value={query}
              onChangeText={handleQueryChange}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
              placeholderTextColor={isDark ? "#aaaaaa" : "#888888"} // Dynamic placeholder color
            />

            <TouchableOpacity
              style={styles.searchButton}
              onPress={
                query.length > 0 ? handleClearInput : handleSearchButtonClick
              }
            >
              <Icon
                name={query.length > 0 ? "x-circle" : "search"}
                size={24}
                color="#007bff"
              />
            </TouchableOpacity>
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <FlatList
            data={searchResults}
            renderItem={renderItem}
            keyExtractor={(item) => item.userID}
            ListEmptyComponent={
              <Text style={styles.emptyMessage}>No results found</Text>
            }
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  innerContainer: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  searchInput: {
    height: 40,
    flex: 1,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 6,
    paddingLeft: 10,
    fontSize: 16,
  },
  searchButton: {
    padding: 10,
    marginLeft: 8,
  },
  userContainer: {
    flexDirection: "row",
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
    justifyContent: "center",
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
  },
  userID: {
    fontSize: 14,
    color: "#777",
  },
  iconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  iconButton: {
    marginHorizontal: 8,
  },
  ellipsisButton: {
    justifyContent: "center",
    alignItems: "center",
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
    zIndex: 9999,
  },
  modalBlurBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  modalProfileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  modalUsername: {
    fontSize: 18,
    fontWeight: "bold",
  },
  toggleButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    width: "48%",
  },
  toggleText: {
    fontSize: 14,
    marginLeft: 10,
  },
  separator: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 10,
  },
  modalActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  modalActionText: {
    fontSize: 16,
    marginLeft: 10,
    color: "#007bff",
  },
  error: {
    color: "red",
    fontSize: 14,
    marginBottom: 12,
  },
  emptyMessage: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginTop: 20,
  },
});

export default SearchScreen;
