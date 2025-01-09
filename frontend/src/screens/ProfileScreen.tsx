import React, { useState, useEffect, useRef } from "react";
import {
  Linking,
  View,
  Text,
  Image,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Animated,
  RefreshControl,
  TextInput, // For the search bar
  ActivityIndicator, // For loading indicators
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { useNavigation } from "@react-navigation/native"; // Navigation hook

import ThemeToggle from "../components/ThemeToggle";
import Ionicons from "react-native-vector-icons/Ionicons";

const apiUrl = "http://192.168.1.30:3005";

const ProfileScreen = ({ navigation }: any) => {

  const [user, setUser] = useState<any>(null);
  const [image, setImage] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // For the Followers/Following/Pending modal
  const [followersModalVisible, setFollowersModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"followers" | "following" | "pending">("followers");

  // Data arrays for each tab
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);

  // Search input
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Error state
  const [error, setError] = useState<string>("");

  // Loading states
  const [loadingFollowers, setLoadingFollowers] = useState<boolean>(false);
  const [loadingFollowing, setLoadingFollowing] = useState<boolean>(false);
  const [loadingPending, setLoadingPending] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  // Animated header height
  const headerHeight = useRef(new Animated.Value(200)).current;
  const [isShrunk, setIsShrunk] = useState(false);

  const navigateToSettings = () => {
    navigation.navigate("Settings");
  };

  useEffect(() => {
    let errorTimer: NodeJS.Timeout;
    if (error) {
      errorTimer = setTimeout(() => {
        setError("");
      }, 3000); // 3 seconds
    }

    return () => {
      if (errorTimer) {
        clearTimeout(errorTimer);
      }
    };
  }, [error]);

  // Fetch user data and posts on component mount
  const fetchUserData = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        setError("No authentication token found.");
        return;
      }

      const response = await axios.get(`${apiUrl}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
      setPosts(response.data.posts || []);
      setError("");
      console.log("User Data:", response.data); // Debugging log
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to fetch user data.");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Helper to calculate actual friend count
  const getActualFriendCount = () => {
    if (!user) return 0;

    // Merge 'friends' and 'friendOf' to get unique friend count
    const friendSet = new Set<number>();
    if (Array.isArray(user.friends)) {
      user.friends.forEach((f: any) => friendSet.add(f.id));
    }
    if (Array.isArray(user.friendOf)) {
      user.friendOf.forEach((f: any) => friendSet.add(f.id));
    }
    return friendSet.size;
  };

  // CLICKABLE PROFILE => open "Followers/Following/Pending" modal
  const openFollowersModal = async () => {
    try {
      setError("");
      setLoadingFollowers(true);
      setLoadingFollowing(true);
      setLoadingPending(true);

      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        setError("No authentication token found.");
        return;
      }

      // Fetch followers
      const followersResponse = await axios.get(
        `${apiUrl}/follow/followers`, // Corrected endpoint
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
       console.log(followersResponse.data)
      setFollowers(followersResponse.data);
      console.log("Followers Data:", followersResponse.data); // Debugging log
      setLoadingFollowers(false);

      // Fetch following
      const followingResponse = await axios.get(
        `${apiUrl}/follow/following`, // Corrected endpoint
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFollowing(followingResponse.data);
      console.log("Following Data:", followingResponse.data); // Debugging log
      setLoadingFollowing(false);

      // Fetch pending follows
      const pendingResponse = await axios.get(
        `${apiUrl}/follow/pending-follows`, // Corrected endpoint
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPending(pendingResponse.data);
      console.log("Pending Follows Data:", pendingResponse.data); // Debugging log
      setLoadingPending(false);

      setFollowersModalVisible(true);
      setSelectedTab("followers"); // default tab
      setSearchQuery("");
    } catch (err) {
      console.error("Failed to open followers modal:", err);
      setError("Failed to load followers data.");
      setLoadingFollowers(false);
      setLoadingFollowing(false);
      setLoadingPending(false);
    }
  };

  // Filter users by search query
  const getFilteredData = () => {
    let data: any[] = [];
    if (selectedTab === "followers") data = followers;
    else if (selectedTab === "following") data = following;
    else if (selectedTab === "pending") data = pending;

    if (!searchQuery) {
      return data;
    }

    return data.filter((u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Action handlers
  const followBack = async (userId: number) => {
    try {
      setError("");
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        setError("No authentication token found.");
        return;
      }

      await axios.post(
        `${apiUrl}/follow/user`, // Corrected endpoint
        { targetUserId: userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(`Followed back user with ID: ${userId}`); // Debugging log

      // Refresh data
      fetchUserData();
      openFollowersModal(); // Refresh modal data
    } catch (err) {
      console.error("Error following back:", err);
      setError("Failed to follow back the user.");
    }
  };

  const unfollow = async (userId: number) => {
    try {
      setError("");
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        setError("No authentication token found.");
        return;
      }

      await axios.delete(
        `${apiUrl}/follow/unfollow/${userId}`, // Corrected endpoint
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(`Unfollowed user with ID: ${userId}`); // Debugging log

      // Refresh data
      fetchUserData();
      openFollowersModal(); // Refresh modal data
    } catch (err) {
      console.error("Error unfollowing:", err);
      setError("Failed to unfollow the user.");
    }
  };

  // Handle pending actions (accept/reject)
  const handlePendingAction = async (followId: number, action: "accept" | "reject") => {
    try {
      setError("");
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        setError("No authentication token found.");
        return;
      }

      const endpoint =
        action === "accept"
          ? `${apiUrl}/follow/accept/${followId}` // Corrected endpoint
          : `${apiUrl}/follow/reject/${followId}`; // Corrected endpoint

      await axios.post(
        endpoint,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(`Follow request ${action}ed for follow ID: ${followId}`); // Debugging log

      // Refresh data
      fetchUserData();
      openFollowersModal(); // Refresh modal data
    } catch (err) {
      console.error(`Error ${action}ing follow request:`, err);
      setError(`Failed to ${action} the follow request.`);
    }
  };

  // Function to launch the image picker for profile picture
  const pickImage = async () => {
    try {
      setError("");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setImage(result.assets[0].uri);
        setModalVisible(true);
      }
    } catch (err) {
      console.error("Error picking image:", err);
      setError("Failed to pick image.");
    }
  };

  // Function to upload the new profile picture to the backend
  const uploadProfilePicture = async () => {
    try {
      setError("");
      setUploadingImage(true);
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        setError("No authentication token found.");
        setUploadingImage(false);
        return;
      }

      const formData = new FormData();

      const file = {
        uri: image,
        type: "image/jpeg",
        name: "profile-picture.jpg",
      };

      const userId = user?.id;
      if (!userId) {
        setError("User ID is required.");
        setUploadingImage(false);
        return;
      }

      formData.append("profilePicture", file as any);
      formData.append("userId", userId.toString());

      const response = await axios.post(
        `${apiUrl}/user/update-profile-picture`, // Corrected endpoint
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUser(response.data.user);
      console.log("Profile picture updated:", response.data.user); // Debugging log
      setModalVisible(false);
      setUploadingImage(false);
      fetchUserData(); // Fetch updated user data after profile picture change
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      setError("Failed to upload profile picture.");
      setUploadingImage(false);
    }
  };

  // Handle the refresh action
  const onRefresh = () => {
    setRefreshing(true);
    fetchUserData()
      .then(() => setRefreshing(false))
      .catch(() => setRefreshing(false));
  };

  // Render each post in the FlatList
  const renderPost = ({ item }: { item: any }) => (
    <View style={styles.postContainer}>
      {item.imageUrl ? (
        <Image
          source={{ uri: `${apiUrl}${item.imageUrl}` }}
          style={styles.squareImage}
        />
      ) : (
        <View style={styles.textContainer}>
          <Text style={styles.postContent}>{item.content}</Text>
        </View>
      )}
    </View>
  );

  // Handle scroll event for shrinking the header
  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    if (currentOffset > 100 && !isShrunk) {
      setIsShrunk(true);
      // Shrink header size when scrolled down past 100 pixels
      Animated.timing(headerHeight, {
        toValue: 80,
        duration: 150,
        useNativeDriver: false,
      }).start();
    } else if (currentOffset < 100 && isShrunk) {
      setIsShrunk(false);
      // Reset header to original size when scrolled back up
      Animated.timing(headerHeight, {
        toValue: 200,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
  };

  // Renders each user in the modal's lists
  const renderUserItem = ({ item }: { item: any }) => {
    if (selectedTab === "followers") {
      // "Followers" are users who follow the current user.
      // Show "Follow Back" if not already following them
      const isAlreadyFollowing = following.some((f) => f.following.id === item.id);
      console.log('following: ', item.id)
      // Debugging: Log comparison results
      console.log(`Checking if already following user ID ${item.id}:`, isAlreadyFollowing);
  
      return (
        <View style={styles.userRow}>
          <Image
            source={{ uri: item.follower.profilePicture || "https://via.placeholder.com/50" }}
            style={styles.userAvatar}
          />
          <Text style={styles.userText}>{item.follower.username}</Text>
          {!isAlreadyFollowing && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => followBack(item.follower.id)}
            >
              <Text style={styles.actionButtonText}>Follow Back</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    } else if (selectedTab === "following") {
      // "Following" are users the current user is following.
      console.log(item.id)
      return (
        <View style={styles.userRow}>
          <Image
            source={{ uri: item.following.profilePicture || "https://via.placeholder.com/50" }}
            style={styles.userAvatar}
          />
          <Text style={styles.userText}>{item.following.username}</Text>
          <TouchableOpacity
            style={styles.unfollowButton}
            onPress={() => unfollow(item.following.id)}
          >
            <Text style={styles.unfollowButtonText}>Unfollow</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      // "Pending" are follow requests sent to the current user.
      return (
        <View style={styles.userRow}>
          <Image
            source={{ uri: item.follower.profilePicture || "https://via.placeholder.com/50" }}
            style={styles.userAvatar}
          />
          <Text style={styles.userText}>{item.follower.username}</Text>
          <View style={styles.pendingActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handlePendingAction(item.id, "accept")}
            >
              <Text style={styles.actionButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handlePendingAction(item.id, "reject")}
            >
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Error Message */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Profile Header Section */}
      <Animated.View style={[styles.profileHeader, { height: headerHeight }]}>
      <TouchableOpacity onPress={navigateToSettings} style={styles.settingsIcon}>
          <Ionicons name="settings-outline" size={24} color="#000" />
        </TouchableOpacity>
        <View
          style={[
            styles.profileTextContainer,
            isShrunk && styles.profileTextContainerShrunk,
          ]}
        >
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={{
                uri: user?.profilePicture || "https://via.placeholder.com/150",
              }}
              style={[
                styles.profileImage,
                isShrunk && styles.profileImageShrunk,
              ]}
            />
          </TouchableOpacity>

          {/* User Info Container */}
          <View
            style={[
              styles.userInfoContainer,
              isShrunk && styles.userInfoContainerShrunk,
            ]}
          >
            <Text style={[styles.username, isShrunk && styles.usernameShrunk]}>
              {user?.username}
            </Text>

            <View
              style={[
                styles.statsContainer,
                isShrunk && styles.statsContainerShrunk,
              ]}
            >
              <Text style={styles.stats}>
                Posts: {posts.length}
              </Text>

              {/* Make this clickable: open modal with three tabs */}
              <TouchableOpacity onPress={openFollowersModal}>
                <Text style={styles.stats}>
                  Follows: {getActualFriendCount()}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Bio Section */}
            <View
              style={[styles.bioContainer, isShrunk && styles.bioContainerShrunk]}
            >
              <Text style={styles.bio}>{user?.bio || "No bio available"}</Text>
              {!isShrunk && user?.website ? (
                <TouchableOpacity
                  onPress={() => Linking.openURL(user.website)}
                >
                  <Text style={styles.website}>
                    {user.website}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Posts Section */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item: any) => item.id.toString()}
        numColumns={3}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={<Text style={styles.emptyListText}>No posts available.</Text>}
        onScroll={handleScroll}
      />

      {/* Modal to confirm the image upload */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Do you want to upload this image?</Text>
            <Image source={{ uri: image }} style={styles.modalImage} />
            {uploadingImage ? (
              <ActivityIndicator size="large" color="#007bff" />
            ) : (
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.modalButton}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={uploadProfilePicture}
                  style={styles.modalButton}
                >
                  <Text style={styles.modalButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Followers / Following / Pending Modal */}
      <Modal
        visible={followersModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setFollowersModalVisible(false)}
      >
        <View style={styles.followersModalContainer}>
          {/* Simple tab buttons */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              onPress={() => {
                setSelectedTab("followers");
                setSearchQuery("");
              }}
              style={[
                styles.tabButton,
                selectedTab === "followers" && styles.tabButtonActive,
              ]}
            >
              <Text style={styles.tabButtonText}>
                Followers ({followers.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSelectedTab("following");
                setSearchQuery("");
              }}
              style={[
                styles.tabButton,
                selectedTab === "following" && styles.tabButtonActive,
              ]}
            >
              <Text style={styles.tabButtonText}>
                Following ({following.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSelectedTab("pending");
                setSearchQuery("");
              }}
              style={[
                styles.tabButton,
                selectedTab === "pending" && styles.tabButtonActive,
              ]}
            >
              <Text style={styles.tabButtonText}>
                Pending ({pending.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search users..."
            />
          </View>

          {/* Loading Indicators */}
          {(selectedTab === "followers" && loadingFollowers) ||
          (selectedTab === "following" && loadingFollowing) ||
          (selectedTab === "pending" && loadingPending) ? (
            <ActivityIndicator size="large" color="#007bff" />
          ) : (
            /* List of users for the selected tab, filtered by search */
            <FlatList
              data={getFilteredData()}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={
                <Text style={styles.emptyListText}>No users found.</Text>
              }
            />
          )}

          {/* Close button */}
          <TouchableOpacity
            onPress={() => setFollowersModalVisible(false)}
            style={styles.closeFollowersModalButton}
          >
            <Text style={styles.closeFollowersModalText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileScreen;

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 10,
  },
  errorContainer: {
    backgroundColor: "#f8d7da",
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },
  errorText: {
    color: "#721c24",
    fontSize: 14,
    textAlign: "center",
  },
  profileHeader: {
    backgroundColor: "#fff",
    alignItems: "center",
    padding: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flexDirection: "column",
    justifyContent: "center",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  profileImageShrunk: {
    width: 65,
    height: 65,
    marginTop: 5,
  },
  profileTextContainer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  profileTextContainerShrunk: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginLeft: 20,
    width: "100%",
  },
  userInfoContainer: {
    alignItems: "center",
    marginLeft: 0,
  },
  userInfoContainerShrunk: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginLeft: 20,
    width: "100%",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  usernameShrunk: {
    fontSize: 18,
    marginLeft: 10,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
    width: "100%",
  },
  statsContainerShrunk: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginLeft: 10,
    width: "100%",
    marginTop: 10,
  },
  stats: {
    fontSize: 16,
    color: "#333",
    marginHorizontal: 15,
  },
  bioContainer: {
    alignItems: "center",
    marginVertical: 10,
    width: "100%",
  },
  bioContainerShrunk: {
    marginLeft: 10,
    alignItems: "flex-start",
    width: "100%",
    marginTop: 10,
  },
  bio: {
    fontSize: 16,
    color: "#666",
    textAlign: "left",
    marginVertical: 5,
  },
  website: {
    fontSize: 16,
    color: "#007bff",
    textDecorationLine: "underline",
    marginVertical: 5,
  },
  postContainer: {
    backgroundColor: "#fff",
    padding: 5,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    maxWidth: "30%", // Adjusted for 3 columns
  },
  squareImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
  },
  textContainer: {
    justifyContent: "center",
    paddingTop: 10,
  },
  postContent: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  // Modal styles for image confirmation
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "80%",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  modalImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
    borderRadius: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: "#007bff",
    borderRadius: 5,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
  },

  // Followers Modal
  followersModalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 10,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 10,
    justifyContent: "space-around",
  },
  tabButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#f0f0f0",
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: "#007bff",
  },
  tabButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
  searchContainer: {
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    justifyContent: "space-between",
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  actionButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  unfollowButton: {
    backgroundColor: "#f44336",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  unfollowButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  pendingActions: {
    flexDirection: "row",
  },
  acceptButton: {
    backgroundColor: "#4caf50",
    marginRight: 5,
  },
  rejectButton: {
    backgroundColor: "#f44336",
  },
  emptyListText: {
    textAlign: "center",
    marginTop: 20,
    color: "#888",
  },
  closeFollowersModalButton: {
    backgroundColor: "#f44336",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
    marginBottom: 40,
  },
  closeFollowersModalText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  settingsIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});