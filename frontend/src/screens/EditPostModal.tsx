import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Image } from "react-native";
import Icon from "react-native-vector-icons/Feather";  // Assuming you're using Feather icons
import { editPost } from "../actions/editPostActions"; // Assuming this action is defined for editing posts

const EditPostModal = ({ isVisible, selectedPost, onSave, onClose }: any) => {
  const [newContent, setNewContent] = useState<string>(selectedPost?.content || "");
  const [newImageUrl, setNewImageUrl] = useState<string>(selectedPost?.imageUrl || "");

  // Update the content whenever selectedPost changes
  useEffect(() => {
    if (selectedPost) {
      setNewContent(selectedPost.content);
      setNewImageUrl(selectedPost.imageUrl || "");
    }
  }, [selectedPost]);

  const saveEditedPost = async () => {
    if (!newContent) {
      alert("Content cannot be empty");
      return;
    }

    // Perform the edit post action
    await editPost(selectedPost.id, newContent);
    onSave(newContent);  // Call onSave to pass the updated content back to the parent
    onClose();  // Close the modal after saving
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={false}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeModalButton} onPress={onClose}>
            <Icon name="x" size={30} color="#000" />
          </TouchableOpacity>

          {/* Optional: Display the post image if available */}
          {newImageUrl && (
            <Image source={{ uri: newImageUrl }} style={styles.modalImage} resizeMode="contain" />
          )}

          {/* Text Input for Editing Post */}
          <TextInput
            style={styles.editTextInput}
            value={newContent}
            onChangeText={setNewContent}
            multiline
            placeholder="Edit your post content"
          />

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={saveEditedPost}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    width: "80%",
    maxHeight: "80%",
  },
  closeModalButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#ddd",
    borderRadius: 50,
    padding: 10,
  },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  editTextInput: {
    width: "100%",
    padding: 10,
    marginBottom: 20,
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    fontSize: 16,
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

export default EditPostModal;