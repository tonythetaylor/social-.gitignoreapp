import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Animated,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";


const mockFriends = [
  {
    id: 1,
    username: "Alice",
    profilePicture: "https://via.placeholder.com/150/FF5733",
  },
  {
    id: 2,
    username: "Bob",
    profilePicture: "https://via.placeholder.com/150/33FF57",
  },
  {
    id: 3,
    username: "Charlie",
    profilePicture: "https://via.placeholder.com/150/5733FF",
  },
  {
    id: 4,
    username: "Diana",
    profilePicture: "https://via.placeholder.com/150/FF33A1",
  },
  {
    id: 5,
    username: "Edward",
    profilePicture: "https://via.placeholder.com/150/A1FF33",
  },
  {
    id: 6,
    username: "Fiona",
    profilePicture: "https://via.placeholder.com/150/33A1FF",
  },
  {
    id: 7,
    username: "George",
    profilePicture: "https://via.placeholder.com/150/FFA133",
  },
  {
    id: 8,
    username: "Helen",
    profilePicture: "https://via.placeholder.com/150/33FFA1",
  },
];

const CollapsibleFriendsHeader = ({
  maxVisible = 8,
  onFriendChange,
}: {
  maxVisible?: number;
  onFriendChange?: (updatedFriends: any[]) => void;
}) => {
  const [friends, setFriends] = useState<any[]>(mockFriends.slice(0, maxVisible));
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newFriend, setNewFriend] = useState("");
  const headerHeight = useRef(new Animated.Value(100)).current; // Default header height
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);

  const toggleHeader = () => {
    const targetHeight = isHeaderExpanded ? 0 : 100;
    Animated.timing(headerHeight, {
      toValue: targetHeight,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsHeaderExpanded(!isHeaderExpanded);
  };

  const addFriend = () => {
    if (newFriend.trim() === "") return;
    const updatedFriends = [
      ...friends,
      { id: Date.now(), username: newFriend, profilePicture: null },
    ];
    setFriends(updatedFriends);
    onFriendChange?.(updatedFriends);
    setNewFriend("");
    setIsModalVisible(false);
  };

  const removeFriend = (id: number) => {
    const updatedFriends = friends.filter((friend) => friend.id !== id);
    setFriends(updatedFriends);
    onFriendChange?.(updatedFriends);
  };

  const renderFriend = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.friendItem}>
      <Image
        source={{
          uri: item.profilePicture || "https://via.placeholder.com/150",
        }}
        style={styles.friendImage}
      />
      <Text style={styles.friendName}>{item.username}</Text>
    </TouchableOpacity>
  );

  const renderEditButton = () => (
    <TouchableOpacity
      style={styles.editButton}
      onPress={() => setIsModalVisible(true)}
    >
      <Icon name="edit" size={24} color="#007bff" />
      <Text style={styles.editButtonText}>Edit</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView  style={styles.safeArea}>
      <View>
        {/* Collapsible Header */}
        <Animated.View style={[styles.header, { height: headerHeight }]}>
          <FlatList
            data={friends}
            horizontal
            renderItem={renderFriend}
            keyExtractor={(item) => item.id.toString()}
            ListFooterComponent={renderEditButton}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.friendList}
          />
        </Animated.View>

        {/* Toggle Button */}
        <TouchableOpacity onPress={toggleHeader} style={styles.toggleButton}>
          <Icon
            name={isHeaderExpanded ? "chevron-up" : "chevron-down"}
            size={24}
            color="#333"
          />
        </TouchableOpacity>

        {/* Modal for Editing Friends */}
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Friends</Text>
                <TouchableOpacity
                  onPress={() => setIsModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Icon name="x" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={friends}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.modalFriend}>
                    <Text style={styles.modalFriendName}>{item.username}</Text>
                    <TouchableOpacity onPress={() => removeFriend(item.id)}>
                      <Icon name="trash-2" size={24} color="red" />
                    </TouchableOpacity>
                  </View>
                )}
              />
              <TextInput
                style={styles.input}
                placeholder="Add new friend..."
                value={newFriend}
                onChangeText={setNewFriend}
              />
              <TouchableOpacity style={styles.addButton} onPress={addFriend}>
                <Text style={styles.addButtonText}>Add Friend</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default CollapsibleFriendsHeader;

const styles = StyleSheet.create({
    safeArea: {
      backgroundColor: "#fff",
    },
    header: {
      backgroundColor: "#fff",
      padding: 10,
      elevation: 2,
      borderBottomWidth: 1,
      borderColor: "#ddd",
    },
    friendList: {
      alignItems: "center",
    },
    friendItem: {
      marginRight: 10,
      alignItems: "center",
    },
    friendImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    friendName: {
      fontSize: 12,
      color: "#333",
    },
    editButton: {
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 10,
    },
    editButtonText: {
      fontSize: 12,
      color: "#007bff",
    },
    toggleButton: {
      alignItems: "center",
      padding: 10,
      backgroundColor: "#fff",
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContainer: {
      width: "90%",
      padding: 20,
      backgroundColor: "#fff",
      borderRadius: 10,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
    },
    closeButton: {
      padding: 5,
    },
    modalFriend: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      marginBottom: 10,
    },
    modalFriendName: {
      fontSize: 16,
      color: "#333",
    },
    input: {
      height: 40,
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 8,
      paddingHorizontal: 10,
      marginBottom: 20,
      width: "100%",
    },
    addButton: {
      backgroundColor: "#007bff",
      padding: 10,
      borderRadius: 8,
      alignItems: "center",
      width: "100%",
    },
    addButtonText: {
      color: "#fff",
      fontSize: 16,
    },
  });