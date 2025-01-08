import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Icon from "react-native-vector-icons/Feather";

const apiUrl = "http://192.168.1.30:3005";

const PostDetailScreen = ({ route, navigation }: any) => {
  const { postId } = route.params; // Get the postId passed from the FeedScreen
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    // Fetch the post details and comments
    const fetchPostDetails = async () => {
      try {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await axios.get(`${apiUrl}/posts/${postId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data) {
          setPost(response.data.post);
          setComments(response.data.comments); // Assuming the post object has associated comments
        }
      } catch (error) {
        console.error("Error fetching post details:", error);
      }
    };

    fetchPostDetails();
  }, [postId]);

  return (
    <View style={styles.container}>
      {post && (
        <>
          <Image source={{ uri: `${apiUrl}${post.imageUrl}` }} style={styles.image} />
          <View style={styles.textContainer}>
            <Text style={styles.content}>{post.content}</Text>
            <Text style={styles.timestamp}>{new Date(post.createdAt).toLocaleString()}</Text>
          </View>

          <Text style={styles.commentTitle}>Comments:</Text>
          <FlatList
            data={comments}
            renderItem={({ item }) => (
              <View style={styles.comment}>
                <Text style={styles.commentText}>{item.content}</Text>
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
          />
        </>
      )}

      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Icon name="x" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: 10,
  },
  textContainer: {
    marginTop: 15,
  },
  content: {
    fontSize: 18,
    color: "#333",
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  comment: {
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  commentText: {
    fontSize: 14,
    color: "#333",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 50,
  },
});

export default PostDetailScreen;