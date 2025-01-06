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
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ScrollView,
  Dimensions,
} from "react-native";
import {
  editPost,
  deletePost,
  archivePost,
  savePost,
} from "../actions/editPostActions"; // Import the action functions
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Icon from "react-native-vector-icons/Feather"; // Import icons
import { getTimeAgo } from "../utils/getTimeAgo";
import { getUserInfoFromToken } from "../utils/getUserFromToken";

const apiUrl = "http://10.0.0.151:3005";

const FeedScreen = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null); // Current user state
  const [newContent, setNewContent] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState<boolean>(false); // Track whether the post is in edit mode
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false); // Track keyboard visibility
  const [modalOffset] = useState(new Animated.Value(0)); // Modal position adjustment
  const [isExpanded, setIsExpanded] = useState(false);
  const [user, setUser] = useState({ username: "", profilePicture: "" });

  // Get screen height and width
  const { height, width } = Dimensions.get("window");

  const toggleText = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userInfo = await getUserInfoFromToken();
      if (userInfo) {
        setUser(userInfo); // Set the user info to state
      }
    };

    fetchUserInfo();
  }, []);

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

  useEffect(() => {
    fetchPosts(page);
    fetchCurrentUser(); // Fetch current user data to check ownership

    // Add keyboard event listeners
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
        Animated.timing(modalOffset, {
          toValue: -100, // Adjust modal position upwards
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
        Animated.timing(modalOffset, {
          toValue: 0, // Reset modal position
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, [page]);

  const fetchCurrentUser = async () => {
    const token = await SecureStore.getItemAsync("authToken");
    if (token) {
      const tokenData = JSON.parse(atob(token.split(".")[1]));
      console.log(tokenData);

      setCurrentUser(tokenData); // Set the current user
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1); // Reset to the first page and reload the posts

    fetchPosts(1)
      .then(() => setRefreshing(false))
      .catch(() => setRefreshing(false));
  };

  const handleLoadMore = () => {
    if (!loading && posts.length < totalPosts) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const imageUrl = item.imageUrl ? `${apiUrl}${item.imageUrl}` : null;
    const profileImageUrl = item.user?.profilePicture
      ? `${item.user.profilePicture}`
      : "https://via.placeholder.com/150"; // Profile image URL

    return (
      <View style={styles.postContainer}>
        <View style={styles.header}>
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
            style={styles.fullImage}
            resizeMode="contain"
          />
        )}

        <View style={styles.textContainer}>
          <Text
            style={styles.postContent}
            numberOfLines={isExpanded ? undefined : 3} // Set a limit of lines to show, 3 for example, when collapsed
            ellipsizeMode="tail" // Add ellipsis if the text is truncated
          >
            {item.content}
          </Text>
        </View>
        {item.content.length > 100 && (
          // Show "Show More" button only if the content length is greater than a threshold
          <TouchableOpacity onPress={toggleText}>
            <Text style={styles.moreText}>
              {isExpanded ? "Show Less" : "Show More"}
            </Text>
          </TouchableOpacity>
        )}
        <Text style={styles.timestamp}>{getTimeAgo(item.createdAt)}</Text>

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
    setNewContent(post.content); // Populate content for editing
    setIsModalVisible(true);
  };

  const closePostModal = () => {
    setIsModalVisible(false);
    setIsEditMode(false);
    setSelectedPost(null);
  };

  const handlePostAction = async (action: string) => {
    if (selectedPost) {
      switch (action) {
        case "edit":
          setIsEditMode(true); // Set to edit mode
          break;
        case "delete":
          await deletePost(selectedPost.id);
          break;
        case "archive":
          await archivePost(selectedPost.id);
          break;
        case "save":
          await savePost(selectedPost.id);
          break;
        default:
          break;
      }
    }
  };

  const renderPostModalActions = () => {
    if (currentUser && selectedPost && currentUser.id === selectedPost.userId) {
      return (
        <View style={styles.modalActions}>
          <TouchableOpacity
            style={styles.modalActionButton}
            onPress={() => handlePostAction("edit")}
          >
            <Icon name="edit-2" size={24} color="black" />
            <Text>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalActionButton}
            onPress={() => handlePostAction("delete")}
          >
            <Icon name="trash-2" size={24} color="red" />
            <Text>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalActionButton}
            onPress={() => handlePostAction("archive")}
          >
            <Icon name="archive" size={24} color="gray" />
            <Text>Archive</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalActionButton}
            onPress={() => handlePostAction("save")}
          >
            <Icon name="save" size={24} color="blue" />
            <Text>Save</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  const saveEditedPost = async () => {
    if (selectedPost) {
      // Check for empty content
      if (!newContent.trim()) {
        alert("Content cannot be empty!");
        return;
      }

      try {
        // Call the editPost action to update the post
        const updatedPost = await editPost(selectedPost.id, newContent);

        if (updatedPost) {
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.id === selectedPost.id
                ? { ...post, content: newContent }
                : post
            )
          );
          setIsEditMode(false);
          setIsModalVisible(false);
        } else {
          alert("Error updating post!");
        }
      } catch (error) {
        console.error("Error saving post:", error);
        alert("Error saving post!");
      }
    }
  };

  const discardChanges = () => {
    setNewContent(selectedPost.content);
    setIsEditMode(false); // Exit edit mode
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <Text style={styles.loadingText}>No posts available.</Text>
          }
        />

        {/* Post Modal */}
        {selectedPost && (
          <Modal
            visible={isModalVisible}
            animationType="slide"
            transparent={false}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalContainer}>
                <Animated.View
                  style={[
                    styles.modalContent,
                    {
                      height:
                        keyboardVisible || isEditMode
                          ? height * 0.6
                          : height * 0.4, // Adjust height based on keyboard visibility
                      width: width, // Full width of screen
                      transform: [{ translateY: modalOffset }],
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.closeModalButton}
                    onPress={closePostModal}
                  >
                    <Icon name="x" size={15} color="#000" />
                  </TouchableOpacity>

                  {/* <Text style={styles.modalTitle}>Post Actions</Text> */}
                  {selectedPost.imageUrl && (
                    <Image
                      source={{ uri: `${apiUrl}${selectedPost.imageUrl}` }}
                      style={styles.modalImage}
                      resizeMode="contain"
                    />
                  )}

                  {/* <ScrollView contentContainerStyle={{ width: '100%' }}> */}
                  {isEditMode ? (
                    <TextInput
                      style={styles.editTextInput}
                      value={newContent}
                      onChangeText={setNewContent}
                      multiline
                      placeholder="Edit your post content"
                    />
                  ) : (
                    <Text
                      style={styles.postContent}
                      numberOfLines={1} // Limit text to a single line
                      ellipsizeMode="tail" // Add ellipsis at the end of the text if it's too long
                    >
                      {selectedPost.content}
                    </Text>
                  )}
                  {/* </ScrollView> */}

                  {isEditMode ? (
                    <View style={styles.modalActions}>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={saveEditedPost}
                      >
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={discardChanges}
                      >
                        <Text style={styles.saveButtonText}>Discard</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    renderPostModalActions()
                  )}
                </Animated.View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    // backgroundColor: "#f8f9fa",
    backgroundColor: "#f7f7f7", // Instagram-like background color
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
    height: 300,
    borderRadius: 10,
    marginBottom: 10,
  },
  textContainer: {
    flexDirection: "row", // Align text and button horizontally
    alignItems: "center", // Vertically align text and button in the center
    marginBottom: 5,
  },
  postContentContainer: {
    alignItems: "center", // Vertically align text and button in the center
    // marginBottom: 5,
  },
  postContent: {
    flex: 1, // Take the full width available
    fontSize: 16,
    color: "#333",
  },
  moreText: {
    fontSize: 14,
    color: "#007bff", // Blue color for "Show More" text
    marginLeft: 5, // Slight margin to separate the button from the text
    flexWrap: "wrap", // Allow wrapping to the next line
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
    padding: 10,
    zIndex: 9999,
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  fullScreenModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 40,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    marginTop: 20,
  },
  modalActionButton: {
    justifyContent: "center",
    alignItems: "center",
    width: "20%",
    paddingVertical: 10,
    borderRadius: 8,
  },
  editTextInput: {
    width: "100%",
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: "#fafafa",
    height: 180,
    textAlignVertical: "top",
  },
  modalActionText: {
    fontSize: 18,
    color: "#007bff",
  },
  saveButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
  },
});

export default FeedScreen;
