import React, { useEffect, useRef, useState } from "react";
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
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Audio } from "expo-av";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Icon from "react-native-vector-icons/Feather"; // Import icons
import { getTimeAgo } from "../utils/getTimeAgo";
import { getUserInfoFromToken } from "../utils/getUserFromToken";
import {
  editPost,
  deletePost,
  archivePost,
  savePost,
} from "../actions/editPostActions"; // Import the action functions
import CollapsibleFriendsHeader from "../components/CollapsibleFriendsHeader";
import { useTheme } from "../providers/ThemeProvider";

const apiUrl = "http://192.168.1.174:3005";

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
  const [currentAudio, setCurrentAudio] = useState<string | null>(null); // Currently playing audio URL
  const soundRef = useRef<Audio.Sound | null>(null); // Reference to audio sound
  const [audioDuration, setAudioDuration] = useState<number | null>(null); // Total duration in milliseconds
  const [isPlaying, setIsPlaying] = useState<boolean>(false); // Track playback state

  // Get screen height and width
  const { height, width } = Dimensions.get("window");

  const { isDark } = useTheme();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

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
  // Fetch posts
  const fetchPosts = async (page: number) => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        throw new Error("No token found");
      }
  
      // Fetch paginated posts
      const response = await axios.get(
        `${apiUrl}/posts?page=${page}&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      const { posts: newPosts, total } = response.data;
  
      if (page === 1) {
        // Reset posts if it's the first page
        setPosts(newPosts);
      } else {
        // Append new posts
        setPosts((prevPosts) => [...prevPosts, ...newPosts]);
      }
  
      setTotalPosts(total); // Update total posts from the API
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
    // Prevent fetching more posts if already loading or all posts are loaded
    if (loading || posts.length >= totalPosts) return;
  
    setLoading(true); // Set loading state
    setPage((prevPage) => prevPage + 1); // Increment page number
  };
  
  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  // Play or stop audio
  const playAudio = async (audioUrl: string) => {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      playThroughEarpieceAndroid: false,
    });

    try {
      if (currentAudio === audioUrl) {
        if (isPlaying) {
          // Pause the audio if it's currently playing
          await soundRef.current?.pauseAsync();
          setIsPlaying(false);
        } else {
          // Resume playback if paused
          await soundRef.current?.playAsync();
          setIsPlaying(true);
        }
      } else {
        if (soundRef.current) {
          await soundRef.current.unloadAsync(); // Unload the previous sound
        }

        const { sound, status } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true } // Automatically play after loading
        );

        soundRef.current = sound;
        setCurrentAudio(audioUrl);
        setIsPlaying(true);

        // Retrieve and set the audio duration if loaded
        if (status.isLoaded) {
          const duration = status.durationMillis || null;
          setAudioDuration(duration);
        } else {
          console.error("Audio not loaded");
        }

        // Add playback status update listener
        sound.setOnPlaybackStatusUpdate((playbackStatus) => {
          if (playbackStatus.isLoaded) {
            if (playbackStatus.didJustFinish) {
              // Playback finished
              setIsPlaying(false);
              setCurrentAudio(null);
            }
          }
        });
      }
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const audioUrl = item.audioUrl ? `${apiUrl}${item.audioUrl}` : null;
    const imageUrl = item.imageUrl ? `${apiUrl}${item.imageUrl}` : null;
    const profileImageUrl = item.user?.profilePicture
      ? `${item.user.profilePicture}` // Ensure full URL
      : "https://via.placeholder.com/150"; // Profile image URL

    // Check if current user liked the post
    const isLiked = item.isLiked; // Assume `isLiked` is sent from the backend

    return (
      <View style={[styles.postContainer, {backgroundColor: isDark ? '#1c1c1c' : '#ffffff'}]}>
        <View style={styles.header}>
          <Image
            source={{ uri: profileImageUrl }}
            style={styles.profileImage}
          />
          <Text style={[styles.username,{ color: isDark ? '#ffffff' : '#1c1c1c' }]}>{item.user?.username}</Text>
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
            style={[styles.postContent,{ color: isDark ? '#ffffff' : '#000000' }]}
            numberOfLines={isExpanded ? undefined : 3} // Set a limit of lines to show, 3 for example, when collapsed
            ellipsizeMode="tail" // Add ellipsis if the text is truncated
          >
            {item.content}
          </Text>
        </View>

        {audioUrl && (
          <View style={styles.audioContainer}>
            <TouchableOpacity
              onPress={() => playAudio(audioUrl)}
              style={styles.audioButton}
            >
              <Icon
                name={
                  currentAudio === audioUrl && isPlaying
                    ? "pause-circle"
                    : "play-circle"
                }
                size={36}
                color="#007bff"
              />
            </TouchableOpacity>
            <Text style={styles.audioLabel}>Audio Post</Text>
            {audioDuration && (
              <Text style={styles.audioDuration}>
                Duration: {(audioDuration / 1000).toFixed(2)}s
              </Text>
            )}
          </View>
        )}

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
          {/* Like Button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => toggleLike(item.id)}
          >
            <Icon
              name={"thumbs-up"}
              size={24}
              color={isLiked ? "blue" : "#333"}
            />
            <Text style={styles.actionCount}>{item.likeCount}</Text>
          </TouchableOpacity>

          {/* Comment Button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => openCommentsModal(item)}
          >
            <Icon name="message-circle" size={24} color="green" />
            <Text style={styles.actionCount}>{item.commentCount}</Text>
          </TouchableOpacity>

          {/* Refresh/Repost Button */}
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="refresh-ccw" size={24} color="orange" />
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="share" size={24} color="purple" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Function to toggle like/unlike
  const toggleLike = async (postId: number) => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        alert("Unauthorized");
        return;
      }

      // Find the post
      const postIndex = posts.findIndex((post) => post.id === postId);
      if (postIndex === -1) return;

      const post = posts[postIndex];

      if (post.isLiked) {
        // Unlike the post
        await axios.delete(`${apiUrl}/posts/${postId}/unlike`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Update state
        const updatedPosts = [...posts];
        updatedPosts[postIndex].isLiked = false;
        updatedPosts[postIndex].likeCount -= 1;
        setPosts(updatedPosts);
      } else {
        // Like the post
        await axios.post(
          `${apiUrl}/posts/${postId}/like`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Update state
        const updatedPosts = [...posts];
        updatedPosts[postIndex].isLiked = true;
        updatedPosts[postIndex].likeCount += 1;
        setPosts(updatedPosts);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      alert("Failed to toggle like.");
    }
  };

  // Comments Modal
  const [commentsModalVisible, setCommentsModalVisible] =
    useState<boolean>(false);
  const [selectedPostComments, setSelectedPostComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState<string>("");

  const openCommentsModal = async (post: any) => {
    setSelectedPost(post);
    setCommentsModalVisible(true);
    await fetchComments(post.id);
  };

  const fetchComments = async (postId: number) => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        alert("Unauthorized");
        return;
      }

      const response = await axios.get(`${apiUrl}/posts/${postId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSelectedPostComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
      alert("Failed to fetch comments.");
    }
  };

  const addCommentToPost = async () => {
    if (newComment.trim() === "") {
      alert("Comment cannot be empty.");
      return;
    }

    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        alert("Unauthorized");
        return;
      }

      const response = await axios.post(
        `${apiUrl}/posts/${selectedPost.id}/comments`,
        {
          content: newComment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update comments state
      setSelectedPostComments([...selectedPostComments, response.data]);

      // Update comment count in posts
      const postIndex = posts.findIndex((post) => post.id === selectedPost.id);
      if (postIndex !== -1) {
        const updatedPosts = [...posts];
        updatedPosts[postIndex].commentCount += 1;
        setPosts(updatedPosts);
      }

      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment.");
    }
  };

  // Function to delete a comment
  const deleteCommentFromPost = async (commentId: number) => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        alert("Unauthorized");
        return;
      }

      await axios.delete(`${apiUrl}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove comment from state
      setSelectedPostComments(
        selectedPostComments.filter((comment) => comment.id !== commentId)
      );

      // Update comment count in posts
      const postIndex = posts.findIndex((post) => post.id === selectedPost.id);
      if (postIndex !== -1) {
        const updatedPosts = [...posts];
        updatedPosts[postIndex].commentCount -= 1;
        setPosts(updatedPosts);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment.");
    }
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
          try {
            await deletePost(selectedPost.id);
  
            // Remove the deleted post from the `posts` state
            setPosts((prevPosts) =>
              prevPosts.filter((post) => post.id !== selectedPost.id)
            );
  
            closePostModal(); // Close the modal after deletion
          } catch (error) {
            console.error("Error deleting post:", error);
            alert("Failed to delete post.");
          }
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
        <View style={[styles.modalActions, { backgroundColor: isDark ? '#121212' : '#f7f7f7', // Changes background based on theme
      }]}>
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
      style={{ flex: 1,
        backgroundColor: isDark ? "#1c1c1c" : "#ffffff",
      }}
    >
      <View style={styles.container}>
      <CollapsibleFriendsHeader
        maxVisible={8}
        onFriendChange={(updatedFriends: any) => {
          console.log("Updated Friends:", updatedFriends);
        }}
      />
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
          showsVerticalScrollIndicator={false} // Hide the scroll bar
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

                  {/* Post Image */}
                  {selectedPost.imageUrl && (
                    <Image
                      source={{ uri: `${apiUrl}${selectedPost.imageUrl}` }}
                      style={styles.modalImage}
                      resizeMode="contain"
                    />
                  )}

                  {/* Edit or View Post Content */}
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

                  {/* Action Buttons */}
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

        {/* Comments Modal */}
        {selectedPost && (
          <Modal
            visible={commentsModalVisible}
            animationType="slide"
            transparent={false}
            onRequestClose={() => setCommentsModalVisible(false)}
          >
            <SafeAreaView style={styles.commentsModalContainer}>
              <View style={styles.commentsModalContainer}>
                <View style={styles.commentsHeader}>
                  <TouchableOpacity
                    onPress={() => setCommentsModalVisible(false)}
                  >
                    <Icon name="arrow-left" size={24} color="#333" />
                  </TouchableOpacity>
                  <Text style={styles.commentsTitle}>Comments</Text>
                </View>

                <FlatList
                  data={selectedPostComments}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.commentContainer}>
                      <Image
                        source={{
                          uri: item.user?.profilePicture
                            ? `${item.user.profilePicture}`
                            : "https://via.placeholder.com/150",
                        }}
                        style={styles.commentAvatar}
                      />
                      <View style={styles.commentContent}>
                        <Text style={styles.commentUsername}>
                          {item.user.username}
                        </Text>
                        <Text style={styles.commentText}>{item.content}</Text>
                        <Text style={styles.commentTimestamp}>
                          {getTimeAgo(item.createdAt)}
                        </Text>
                      </View>
                      {currentUser && currentUser.id === item.userId && (
                        <TouchableOpacity
                          onPress={() => deleteCommentFromPost(item.id)}
                        >
                          <Icon name="trash-2" size={20} color="red" />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                  ListEmptyComponent={
                    <Text style={styles.loadingText}>No comments yet.</Text>
                  }
                />

                <View style={styles.addCommentContainer}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Add a comment..."
                    value={newComment}
                    onChangeText={setNewComment}
                  />
                  <TouchableOpacity onPress={addCommentToPost}>
                    <Icon name="send" size={24} color="#007bff" />
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
          </Modal>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default FeedScreen;

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    // backgroundColor: "#f8f9fa",
    // backgroundColor: "#f7f7f7", // Instagram-like background color
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
    justifyContent: "flex-end", // Align all icons to the left
    marginTop: 10,
    gap: 0, // Add spacing between the icons
  },
  iconButton: {
    flexDirection: "row", // Align icon and count horizontally
    alignItems: "center", // Vertically align icon and count
    marginRight: 20, // Add spacing between the buttons
  },
  actionCount: {
    fontSize: 12,
    color: "#333",
    marginLeft: 5, // Add spacing between the icon and count
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
  commentsModalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  commentsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  commentContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
    backgroundColor: "#f1f0f0",
    borderRadius: 10,
    padding: 10,
  },
  commentUsername: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  commentText: {
    fontSize: 14,
    color: "#333",
  },
  commentTimestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  addCommentContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 10,
  },
  commentInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#f9f9f9",
  },
  audioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  audioButton: {
    marginRight: 10,
  },
  audioLabel: {
    fontSize: 16,
    color: "#007bff",
  },
  audioDuration: {
    fontSize: 14,
    color: "#888",
    marginLeft: 10,
  },
});

