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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

const apiUrl = "http://10.0.0.151:3005";

const ProfileScreen = () => {
  const [user, setUser] = useState<any>();
  const [image, setImage] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Animated header height
  const headerHeight = useRef(new Animated.Value(200)).current;
  const [isShrunk, setIsShrunk] = useState(false);

  // Fetch user data and posts on component mount
  const fetchUserData = async () => {
    const token = await SecureStore.getItemAsync("authToken");
    const response = await axios.get(`${apiUrl}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(response.data);
    setPosts(response.data.posts); // Assuming the posts data is returned as part of the response
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Function to launch the image picker for profile picture
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      setImage(result.assets[0].uri);
      setModalVisible(true);
    }
  };

  // Function to upload the new profile picture to the backend
  const uploadProfilePicture = async () => {
    const token = await SecureStore.getItemAsync("authToken");
    const formData = new FormData();

    const file = {
      uri: image,
      type: "image/jpeg",
      name: "profile-picture.jpg",
    };

    const userId = user?.id;
    if (!userId) {
      console.error("User ID is required");
      return;
    }

    formData.append("profilePicture", file as any);
    formData.append("userId", userId);

    try {
      const response = await axios.post(
        `${apiUrl}/user/update-profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUser(response.data.user);
      console.log("Profile picture updated");
      setModalVisible(false);
      fetchUserData(); // Fetch updated user data after profile picture change
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  // Handle the refresh action
  const onRefresh = () => {
    setRefreshing(true);
    fetchUserData()
      .then(() => {
        setRefreshing(false);
      })
      .catch(() => {
        setRefreshing(false);
      });
  };

  // Render each post in the FlatList
  const renderPost = ({ item }: { item: any }) => (
    <View style={styles.postContainer}>
      {item.imageUrl ? (
        <Image
          source={{ uri: `${apiUrl}${item.imageUrl}` }}
          style={styles.squareImage} // Apply square styling to the image
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
        toValue: 80, // Shrink the header size
        duration: 150, // Faster animation duration
        useNativeDriver: false,
      }).start();
    } else if (currentOffset < 100 && isShrunk) {
      setIsShrunk(false);
      // Reset header to original size when scrolled back up
      Animated.timing(headerHeight, {
        toValue: 200, // Reset to original size
        duration: 150, // Faster animation duration
        useNativeDriver: false,
      }).start();
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile Header Section */}
      <Animated.View style={[styles.profileHeader, { height: headerHeight }]}>
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
          Posts: {user?.posts?.length || 0}
        </Text>
        <Text style={styles.stats}>
          Friends: {user?.friends?.length || 0}
        </Text>
      </View>

      {/* Bio Section */}
      <View style={[styles.bioContainer, isShrunk && styles.bioContainerShrunk]}>
        <Text style={styles.bio}>{user?.bio || "No bio available"}</Text>
        {!isShrunk && (
          <TouchableOpacity onPress={() => Linking.openURL(user?.website || "#")}>
            <Text style={styles.website}>
              {user?.website || "No website"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  </View>
</Animated.View>

{/* Posts Section */}
<FlatList
  data={posts}
  renderItem={renderPost}
  keyExtractor={(item: any) => item.id.toString()}
  numColumns={3} // Display posts in a grid with 3 columns
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
  ListEmptyComponent={<Text>No posts available.</Text>}
  onScroll={handleScroll} // Handle scroll for shrinking header
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
      <View style={styles.modalButtons}>
        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
          <Text style={styles.modalButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={uploadProfilePicture} style={styles.modalButton}>
          <Text style={styles.modalButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
    </View>
  );
};

// Updated styles for grid layout and user-friendly profile header
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 10,
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
    marginTop: 5, // Moves the image down when shrunk to align with other elements
  },
  profileTextContainer: {
    marginTop: 10,
    flexDirection: "row", // Align image and stats side by side when not shrunk
    justifyContent: "space-between", // Space out the items
    alignItems: "center", // Center items vertically
    width: "100%",
  },
  profileTextContainerShrunk: {
    flexDirection: "row", // Align horizontally when shrunk
    alignItems: "center", // Align items horizontally
    justifyContent: "flex-start", // Align to the left
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
    alignItems: "flex-start", // Align bio text to the left
    width: "100%",
    marginTop: 10, // Add space between stats and bio when shrunk
  },
  bio: {
    fontSize: 16,
    color: "#666",
    textAlign: "left", // Align text to the left when shrunk
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
    maxWidth: "100%",
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
  timestamp: {
    fontSize: 12,
    color: "#888",
  },
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
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  modalImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 10,
  },
  modalButtons: {
    flexDirection: "row",
  },
  modalButton: {
    padding: 10,
    margin: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default ProfileScreen;
