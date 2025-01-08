import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Icon from "react-native-vector-icons/Feather";
import { useGiphySearch } from "../hooks/useGiphySearch";

// Replace with your own API URL
const apiUrl = process.env.REACT_APP_API_URL || "http://192.168.1.30:3005";

const CreatePostScreen = ({ navigation }: any) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<any>(null);
  const [error, setError] = useState("");
  const [selectedGif, setSelectedGif] = useState<any>(null);
  const [isGifModalVisible, setIsGifModalVisible] = useState(false);

  // Giphy search hook
  const { searchQuery, setSearchQuery, gifResults, isLoading, searchGifs } =
    useGiphySearch();

  // Launch image picker
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  // Convert image URI to Blob
  const createBlob = async (uri: string) => {
    const response = await fetch(uri);
    return response.blob();
  };

  // Handle post submission
  const handlePost = async () => {
    if (!content) {
      setError("Post content cannot be empty");
      return;
    }

    const token = await SecureStore.getItemAsync("authToken");
    const formData = new FormData();
    formData.append("content", content);

    // If user picked an image
    if (image) {
      const blob = await createBlob(image);
      const file = {
        uri: image,
        type: "image/jpeg",
        name: "post-image.jpg",
      };
      formData.append("image", file as any);
    }

    // If user picked a GIF
    if (selectedGif) {
      const gifFile = {
        uri: selectedGif.images.original.url,
        type: "image/gif",
        name: "post-gif.gif",
      };
      formData.append("gif", gifFile as any);
    }

    try {
      await axios.post(`${apiUrl}/posts/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      // Clear everything and go back
      setContent("");
      setImage(null);
      setSelectedGif(null);
      setError("");
      navigation.goBack();
    } catch (err) {
      setError("Failed to create post.");
      console.error(err);
    }
  };

  // Clear any selected image/GIF
  const clearMedia = () => {
    setImage(null);
    setSelectedGif(null);
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        {/* Post content input */}
        <TextInput
          style={styles.input}
          placeholder="What's on your mind?"
          value={content}
          onChangeText={setContent}
          multiline
          maxLength={280}
        />

        {/* Container for the image/GIF buttons */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
            <Icon name="image" size={24} color="#007bff" />
          </TouchableOpacity>

          {/* Replaced camera icon with a gift (present) icon */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setIsGifModalVisible(true)}
          >
            <Icon name="gift" size={24} color="#007bff" />
          </TouchableOpacity>
        </View>

        {/* Selected image preview */}
        {image && (
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: image }}
              style={styles.selectedImage}
              resizeMode="contain"
            />
            <TouchableOpacity onPress={clearMedia} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Selected GIF preview */}
        {selectedGif && (
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: selectedGif.images.original.url }}
              style={styles.selectedGif}
              resizeMode="contain"
            />
            <TouchableOpacity onPress={clearMedia} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Error message */}
        {error && <Text style={styles.error}>{error}</Text>}

        {/* Submit (Post) button */}
        <TouchableOpacity style={styles.submitButton} onPress={handlePost}>
          <Text style={styles.submitButtonText}>Post</Text>
        </TouchableOpacity>

        {/* GIF Modal */}
        <Modal
          visible={isGifModalVisible}
          animationType="slide"
          transparent={true}
        >
          <TouchableWithoutFeedback onPress={() => setIsGifModalVisible(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={styles.closeModalButton}
                  onPress={() => setIsGifModalVisible(false)}
                >
                  <Icon name="x" size={24} color="#000" />
                </TouchableOpacity>

                <TextInput
                  style={styles.input}
                  placeholder="Search for a GIF"
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    searchGifs(text);
                  }}
                />

                {isLoading ? (
                  <Text>Loading...</Text>
                ) : (
                  <>
                    {gifResults.length === 0 && !isLoading && (
                      <Text style={styles.noResultsText}>
                        No GIFs found. Try another search!
                      </Text>
                    )}
                    <FlatList
                      data={gifResults}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.gifItem}
                          onPress={() => {
                            setSelectedGif(item);
                            setIsGifModalVisible(false);
                          }}
                        >
                          <Image
                            source={{ uri: item.images.fixed_height.url }}
                            style={styles.gifPreview}
                          />
                        </TouchableOpacity>
                      )}
                      keyExtractor={(item) => item.id}
                      numColumns={3}
                      contentContainerStyle={styles.gridContainer}
                    />
                  </>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#ffffff",
  },
  input: {
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
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
    paddingHorizontal: 10,
  },
  iconButton: {
    justifyContent: "center",
    alignItems: "center",
    width: "45%",
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#f0f8ff",
  },
  previewContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  selectedImage: {
    width: "100%",
    height: 250,
    borderRadius: 12,
  },
  selectedGif: {
    width: "100%",
    height: 250,
    borderRadius: 12,
  },
  clearButton: {
    marginTop: 10,
    backgroundColor: "#e74c3c",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  error: {
    color: "#e74c3c",
    marginBottom: 20,
    fontWeight: "600",
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#28a745",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
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
    width: "90%",
    maxHeight: "80%",
    position: "relative",
  },
  closeModalButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#ddd",
    borderRadius: 50,
    padding: 8,
    zIndex: 1,
  },
  gifItem: {
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "30%",
  },
  gifPreview: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  gridContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  noResultsText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 10,
  },
});