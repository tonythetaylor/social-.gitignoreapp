import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { getTimeAgo } from "../utils/getTimeAgo";

interface PostItemProps {
  item: any;
  onPressMore?: () => void;
  onPressLike?: () => void;
  onPressComment?: () => void;
  isPost?: boolean; // Determines if the item is a post or a comment
  isLiked?: boolean;
  likeCount?: number;
  commentCount?: number;
  onLongPress?: () => void; // For comments
}

const PostItem: React.FC<PostItemProps> = ({
  item,
  onPressMore,
  onPressLike,
  onPressComment,
  isPost = true,
  isLiked = false,
  likeCount = 0,
  commentCount = 0,
  onLongPress,
}) => {
  const imageUrl = item.imageUrl ? `${item.imageUrl}` : null;
  const profileImageUrl = item.user?.profilePicture
    ? `${item.user.profilePicture}` // Ensure full URL
    : "https://via.placeholder.com/150"; // Placeholder image

  return (
    <TouchableOpacity
      activeOpacity={isPost ? 1 : 0.7}
      onPress={isPost ? undefined : onLongPress}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
        <Text style={styles.username}>{item.user?.username}</Text>
        {isPost && (
          <TouchableOpacity onPress={onPressMore}>
            <Icon name="more-horizontal" size={24} color="#333" />
          </TouchableOpacity>
        )}
      </View>

      {/* Image */}
      {imageUrl && (
        <Image source={{ uri: imageUrl }} style={styles.fullImage} resizeMode="contain" />
      )}

      {/* Content */}
      <View style={styles.textContainer}>
        <Text
          style={styles.content}
          numberOfLines={item.isExpanded ? undefined : 3}
          ellipsizeMode="tail"
        >
          {item.content}
        </Text>
        {/* Show More/Less for expanded content */}
        {item.content.length > 100 && (
          <TouchableOpacity onPress={item.toggleExpand}>
            <Text style={styles.moreText}>
              {item.isExpanded ? "Show Less" : "Show More"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Timestamp */}
      <Text style={styles.timestamp}>{getTimeAgo(item.createdAt)}</Text>

      {/* Action Buttons */}
      {isPost && (
        <View style={styles.actions}>
          {/* Like Button */}
          <TouchableOpacity style={styles.iconButton} onPress={onPressLike}>
            <Icon name={isLiked ? "thumbs-up" : "thumbs-up"} size={24} color={isLiked ? "blue" : "#333"} />
            <Text style={styles.actionCount}>{likeCount}</Text>
          </TouchableOpacity>

          {/* Comment Button */}
          <TouchableOpacity style={styles.iconButton} onPress={onPressComment}>
            <Icon name="message-circle" size={24} color="green" />
            <Text style={styles.actionCount}>{commentCount}</Text>
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
      )}
    </TouchableOpacity>
  );
};

export default React.memo(PostItem);

const styles = StyleSheet.create({
  container: {
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
    flex: 1,
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
  content: {
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
  actionCount: {
    fontSize: 12,
    color: "#333",
    marginTop: 2,
  },
});