import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Audio } from "expo-av";
import Icon from "@expo/vector-icons/Feather";
import { Svg, Rect } from "react-native-svg";

interface VoiceRecorderProps {
  onRecordingComplete: (uri: string) => void;
  onRecordingStatusUpdate?: (status: string) => void;
  initialRecordingUri?: string;
  onClose?: () => void; // Prop to handle modal close
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onRecordingStatusUpdate,
  initialRecordingUri,
  onClose,
}) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(
    initialRecordingUri || null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [waveData, setWaveData] = useState<number[]>([]);

  const stopAll = async () => {
    if (isRecording && recording) {
      try {
        await recording.stopAndUnloadAsync();
        setRecording(null);
        setIsRecording(false);
      } catch (err) {
        console.error("Error stopping recording:", err);
      }
    }
    if (isPlaying && sound) {
      try {
        await sound.stopAsync();
        setSound(null);
        setIsPlaying(false);
      } catch (err) {
        console.error("Error stopping playback:", err);
      }
    }
  };

  useEffect(() => {
    // Request microphone permissions
    (async () => {
      const response = await Audio.requestPermissionsAsync();
      if (response.status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Sorry, we need microphone permissions to make this work!",
          [{ text: "OK" }]
        );
      }
    })();

    // Cleanup on component unmount
    return () => {
      stopAll();
    };
  }, []);

  useEffect(() => {
    // Stop all activity if the modal is closed
    if (onClose) {
      stopAll();
    }
  }, [onClose]);

  const startRecording = async () => {
    try {
      setIsLoading(true);

      if (recording) {
        await recording.stopAndUnloadAsync();
        setRecording(null);
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
      setIsLoading(false);

      const interval = setInterval(async () => {
        if (newRecording) {
          try {
            const status = await newRecording.getStatusAsync();
            if (status.isRecording) {
              const amplitude = Math.random() * 100;
              setWaveData((prev) => [...prev.slice(-20), amplitude]);
            }
          } catch (err) {
            console.error("Error fetching recording status", err);
          }
        }
      }, 100);

      newRecording.setOnRecordingStatusUpdate((status) => {
        if (!status.isRecording) {
          clearInterval(interval);
        }
        if (status.isRecording) {
          setRecordingDuration(status.durationMillis || 0);
          if (onRecordingStatusUpdate) {
            onRecordingStatusUpdate("Recording...");
          }
        }
      });
    } catch (err) {
      console.error("Failed to start recording:", err);
      Alert.alert("Recording Error", "Could not start recording.");
      setIsLoading(false);
    }
  };

  const stopRecording = async () => {
    try {
      setIsLoading(true);
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      setRecording(null);
      setIsRecording(false);
      setIsLoading(false);

      if (uri) {
        onRecordingComplete(uri);
        if (onRecordingStatusUpdate) {
          onRecordingStatusUpdate("Recording complete");
        }
      }
    } catch (err) {
      console.error("Failed to stop recording:", err);
      Alert.alert("Recording Error", "Could not stop recording.");
      setIsLoading(false);
    }
  };

  const playAudio = async () => {
    if (!recordingUri) return;
    try {
      setIsLoading(true);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false,
      });

      if (sound) {
        await sound.playAsync();
        setIsPlaying(true);
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: recordingUri },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            if (status.didJustFinish) {
              setIsPlaying(false);
              newSound.unloadAsync();
              setSound(null);
            }
          } else if (status.error) {
            console.error(`Playback Error: ${status.error}`);
            Alert.alert("Playback Error", "An error occurred during playback.");
            setIsPlaying(false);
          }
        });
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Error playing audio:", err);
      Alert.alert("Playback Error", "Could not play the audio.");
      setIsLoading(false);
    }
  };

  const renderWaveform = () => {
    const barWidth = 4;
    const barGap = 2;
    return (
      <Svg height="100" width="100%" style={styles.waveform}>
        {waveData.map((value, index) => (
          <Rect
            key={index}
            x={index * (barWidth + barGap)}
            y={50 - value / 2} // Center vertically
            width={barWidth}
            height={value}
            rx={2} // Rounded corners
            fill="#007bff"
          />
        ))}
      </Svg>
    );
  };

  const formatDuration = (millis: number): string => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <View style={styles.container}>
      {recordingUri ? (
        <View style={styles.audioControls}>
          {isPlaying ? (
            <TouchableOpacity onPress={stopAll} style={styles.playButton}>
              <Icon name="pause-circle" size={40} color="#007bff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={playAudio} style={styles.playButton}>
              <Icon name="play-circle" size={40} color="#007bff" />
            </TouchableOpacity>
          )}
          {renderWaveform()}
        </View>
      ) : isRecording ? (
        <View style={styles.recordingContainer}>
          <Text style={styles.recordingText}>
            Recording... {formatDuration(recordingDuration)}
          </Text>
          {renderWaveform()}
          <TouchableOpacity onPress={stopRecording} style={styles.stopButton}>
            <Icon name="stop-circle" size={40} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={startRecording}
          style={styles.recordButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Icon name="mic" size={30} color="#fff" />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

export default VoiceRecorder;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  recordingContainer: {
    alignItems: "center",
    width: "100%",
  },
  recordingText: {
    fontSize: 18,
    color: "#333",
    marginBottom: 10,
  },
  stopButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#e74c3c",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  audioControls: {
    alignItems: "center",
  },
  playButton: {
    marginBottom: 10,
  },
  waveform: {
    marginVertical: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
});