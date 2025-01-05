import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  RefreshControl,
  Modal,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Icon from "react-native-vector-icons/Feather"; // Import icons

const apiUrl = "http://192.168.1.30:3005";

const FeedScreen = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  // Fetch posts from the server
  const fetchPosts = async (page: number) => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        throw new Error("No token found");
      }

      const tokenData = JSON.parse(atob(token.split(".")[1])); // Decode JWT token
      const expiryTime = tokenData.exp * 1000; // Convert exp to milliseconds
      const currentTime = Date.now();

      if (currentTime > expiryTime) {
        console.log("Session expired, please log in again");
        return;
      }

      const response = await axios.get(`${apiUrl}/posts?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (
        response.data &&
        response.data.posts &&
        response.data.posts.length > 0
      ) {
        if (page === 1) {
          setPosts(response.data.posts);
        } else {
          setPosts((prevPosts) => [...prevPosts, ...response.data.posts]);
        }
        setTotalPosts(response.data.totalPosts);
      } else {
        console.log("No posts found");
      }

      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load posts on mount
  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1); // Reset to first page and reload the posts
    fetchPosts(1).then(() => setRefreshing(false)).catch(() => setRefreshing(false));
  };

  const handleLoadMore = () => {
    if (!loading && posts.length < totalPosts) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const imageUrl = item.imageUrl ? `${apiUrl}${item.imageUrl}` : null;
    const profileImageUrl = item.user?.profilePicture ? `${apiUrl}${item.user.profilePicture}` : "https://via.placeholder.com/150"; // Profile image URL

    return (
      <View style={styles.postContainer}>
        <View style={styles.header}>
          {/* User Profile Image */}
          <Image
            source={{ uri: profileImageUrl }}
            style={styles.profileImage}
          />
          <Text style={styles.username}>{item.user?.username}</Text>
          <TouchableOpacity onPress={() => openPostModal(item)}>
            <Icon name="more-horizontal" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.fullImage} // Full image with dynamic height
            resizeMode="contain" // Ensures the image keeps its aspect ratio
          />
        )}

        <View style={styles.textContainer}>
          <Text style={styles.postContent}>{item.content}</Text>
          <Text style={styles.timestamp}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>

        {/* Action Icons Below Each Post */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="thumbs-up" size={24} color="blue" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="message-circle" size={24} color="green" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="refresh-ccw" size={24} color="orange" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="share" size={24} color="purple" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const openPostModal = (post: any) => {
    setSelectedPost(post);
    setIsModalVisible(true);
  };

  const closePostModal = () => {
    setIsModalVisible(false);
    setSelectedPost(null);
  };

  if (loading && page === 1) {
    return <Text style={styles.loadingText}>Loading posts...</Text>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={<Text style={styles.loadingText}>No posts available.</Text>}
      />

      {/* Post Modal */}
      {selectedPost && (
        <Modal visible={isModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeModalButton} onPress={closePostModal}>
                <Icon name="x" size={24} color="#000" />
              </TouchableOpacity>

              <Text style={styles.modalTitle}>Post Details</Text>
              <Text style={styles.modalText}>{selectedPost.content}</Text>
              <Text style={styles.modalText}>By: {selectedPost.user?.username}</Text>
              <Text style={styles.modalText}>Timestamp: {new Date(selectedPost.createdAt).toLocaleString()}</Text>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 18,
    color: "#333",
  },
  postContainer: {
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  fullImage: {
    width: "100%",
    height: 300, // Height to be dynamically adjusted to show full image
    borderRadius: 10,
    marginBottom: 10,
  },
  textContainer: {
    paddingTop: 10,
  },
  postContent: {
    fontSize: 16,
    color: "#333",
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  iconButton: {
    justifyContent: "center",
    alignItems: "center",
    width: "20%",
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeModalButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#ddd",
    borderRadius: 50,
    padding: 5,
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
    width: "80%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
});

export default FeedScreen;