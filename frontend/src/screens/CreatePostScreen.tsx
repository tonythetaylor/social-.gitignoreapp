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
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Icon from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useGiphySearch } from "../hooks/useGiphySearch";
import VoiceRecorder from "../components/VoiceRecorder"; // Import VoiceRecorder
import { Audio } from "expo-av";
import { useTheme } from "../providers/ThemeProvider";

const apiUrl = process.env.REACT_APP_API_URL || "http://192.168.1.174:3005";

const CreatePostScreen = ({ navigation }: any) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<any>(null);
  const [error, setError] = useState("");
  const [selectedGif, setSelectedGif] = useState<any>(null);
  const [isGifModalVisible, setIsGifModalVisible] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isRecordingModalVisible, setIsRecordingModalVisible] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { isDark } = useTheme();

  const { searchQuery, setSearchQuery, gifResults, isLoading, searchGifs } =
    useGiphySearch();

  const clearAllFields = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch (error) {
        console.error("Error stopping or unloading audio:", error);
      } finally {
        setSound(null);
        setIsPlaying(false);
      }
    }
    setContent("");
    setImage(null);
    setSelectedGif(null);
    setAudioUri(null);
    setError("");
    setSearchQuery("");
    searchGifs("");
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera permission is required.", [
        { text: "OK" },
      ]);
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePlayAudio = async () => {
    if (!audioUri) return;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });

    try {
      // If already playing, stop the existing playback
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      }

      // Create a new playback instance
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          newSound.unloadAsync();
          setSound(null);
        }
      });
    } catch (error) {
      console.error("Error playing audio:", error);
      Alert.alert("Playback Error", "Could not play the audio.");
    }
  };

  const handleStopAudio = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch (error) {
        console.error("Error stopping audio:", error);
      } finally {
        setIsPlaying(false);
        setSound(null);
      }
    }
  };

  const handleRecordingComplete = (uri: string) => {
    setAudioUri(uri);
    setIsRecordingModalVisible(false);
  };

  const handlePost = async () => {
    if (!content && !image && !selectedGif && !audioUri) {
      setError("Post content or media cannot be empty");
      return;
    }

    const token = await SecureStore.getItemAsync("authToken");
    if (!token) {
      setError("You must be logged in to create a post.");
      return;
    }

    const formData = new FormData();
    formData.append("content", content);

    // Add image to FormData
    if (image) {
      const imageFile = {
        uri: image,
        type: "image/jpeg", // Adjust this if needed based on the selected image type
        name: "post-image.jpg",
      };
      formData.append("image", imageFile as any);
    }

    // Add GIF URL to FormData
    if (selectedGif) {
      const gifFile = {
        uri: selectedGif.images.original.url,
        type: "image/gif",
        name: "post-gif.gif",
      };
      formData.append("gif", gifFile as any);
    }
    // Add audio to FormData
    if (audioUri) {
      const audioFile = {
        uri: audioUri,
        type: "audio/mpeg",
        name: "post-audio.mp3",
      };
      formData.append("audio", audioFile as any);
    }

    try {
      const response = await axios.post(`${apiUrl}/posts/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        // Successfully created post
        clearAllFields();
        navigation.navigate("Feed");
      } else {
        setError("Failed to create post.");
      }
    } catch (err) {
      setError("Failed to create post.");
      console.error(err);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: isDark ? "#1c1c1c" : "#ffffff" },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              clearAllFields();
              navigation.goBack();
            }}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={clearAllFields}>
            <Icon name="x" size={24} color={isDark ? "#fff" : "#1c1c1c"} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { 
              backgroundColor: isDark ? "#1c1c1c" : "#ffffff",
              color: isDark ? "#fff" : "#000",
          }]}
            placeholder="What's on your mind?"
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={280}
            placeholderTextColor={isDark ? "#aaaaaa" : "#888888"} // Dynamic placeholder color
          />
        </View>

        {image && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: image }} style={styles.imagePreview} />
          </View>
        )}

        {selectedGif && (
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: selectedGif.images.fixed_height.url }}
              style={styles.imagePreview}
            />
          </View>
        )}

        {audioUri && (
          <View style={styles.audioPreview}>
            {isPlaying ? (
              <TouchableOpacity onPress={handleStopAudio}>
                <Icon name="pause-circle" size={30} color="#007bff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handlePlayAudio}>
                <Icon name="play-circle" size={30} color="#007bff" />
              </TouchableOpacity>
            )}
            <Text style={styles.audioText}>Audio Recorded</Text>
          </View>
        )}

        <View style={styles.mediaButtonsContainer}>
          <TouchableOpacity onPress={pickImage} style={[styles.mediaButton, { backgroundColor: isDark ? "#1c1c1c" : "#ffffff"}]}>
            <Icon name="image" size={24} color="#007bff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={takePhoto} style={[styles.mediaButton, { backgroundColor: isDark ? "#1c1c1c" : "#ffffff"}]}>
            <Icon name="camera" size={24} color="#007bff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsGifModalVisible(true)}
            style={[styles.mediaButton, { backgroundColor: isDark ? "#1c1c1c" : "#ffffff"}]}
          >
            <MaterialCommunityIcons
              name="file-gif-box"
              size={24}
              color="#007bff"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsRecordingModalVisible(true)}
            style={[styles.mediaButton, { backgroundColor: isDark ? "#1c1c1c" : "#ffffff"}]}
          >
            <Icon name="mic" size={24} color="#007bff" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.postButton,
            {
              backgroundColor:
                isDark && content || image || selectedGif || audioUri
                  ? "#007bff"
                  : "#ccc",
            },
          ]}
          onPress={handlePost}
        >
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>

        {/* GIF Modal */}
        <Modal
          visible={isGifModalVisible}
          animationType="slide"
          transparent={true}
        >
          <TouchableWithoutFeedback>
            <SafeAreaView style={[styles.fullScreenModal, { backgroundColor: isDark ? "#1c1c1c" : "#ffffff"}]}>
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setIsGifModalVisible(false)}
              >
                <Icon name="x" size={24} color={isDark ? "#fff" : "#1c1c1c"} />
              </TouchableOpacity>
              <TextInput
                style={[styles.searchInput, { 
                  backgroundColor: isDark ? "#1c1c1c" : "#ffffff",
                  color: isDark ? "#fff" : "#000",
              }]}
                placeholder="Search for a GIF"
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  searchGifs(text);
                }}
                autoFocus
                placeholderTextColor={isDark ? "#aaaaaa" : "#888888"} // Dynamic placeholder color
              />
              {isLoading ? (
                <View style={styles.centeredContainer}>
                  <ActivityIndicator size="large" color="#007bff" />
                </View>
              ) : (
                <FlatList
                  contentContainerStyle={styles.gifListContainer}
                  data={gifResults}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedGif(item);
                        setIsGifModalVisible(false);
                      }}
                      style={styles.gifItemContainer}
                    >
                      <Image
                        source={{ uri: item.images.fixed_height.url }}
                        style={styles.gifPreview}
                      />
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.id}
                  numColumns={3}
                />
              )}
            </SafeAreaView>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Recording Modal */}
        <Modal
          visible={isRecordingModalVisible}
          animationType="fade"
          transparent={true}
        >
          <View style={[styles.centeredModal]}>
            <View style={[styles.recordingModalContent, { backgroundColor: isDark ? '#1c1c1c' : '#ffffff' }]}>
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setIsRecordingModalVisible(false)}
              >
              <Icon name="x" size={24} color={isDark ? '#fff' : '#1c1c1c'} />
              </TouchableOpacity>
              <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelText: {
    fontSize: 16,
    color: "#007bff",
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 100,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 10,
    // backgroundColor: "#f9f9f9",
  },
  previewContainer: {
    marginBottom: 20,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  audioPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  audioText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  mediaButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  mediaButton: {
    padding: 10,
    backgroundColor: "#f0f8ff",
    borderRadius: 8,
  },
  postButton: {
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
  },
  postButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  fullScreenModal: {
    flex: 1,
    padding: 20,
    marginTop: 30,
    backgroundColor: "#fff",
  },
  closeModalButton: {
    alignSelf: "flex-end",
  },
  gifPreview: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 8,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    // height: "100%",
  },
  gifListContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1, // Ensures even spacing
  },
  gifItemContainer: {
    margin: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  searchInput: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  centeredModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  recordingModalContent: {
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
