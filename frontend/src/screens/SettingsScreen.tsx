import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { useTheme } from "../providers/ThemeProvider";
import Ionicons from "react-native-vector-icons/Ionicons";

const SettingsScreen = ({ navigation }: any) => {
  const { isDark, toggleTheme } = useTheme();

  const settingsOptions = [
    { id: 1, title: "Notifications", icon: "notifications-outline" },
    { id: 2, title: "Saved", icon: "bookmark-outline" },
    { id: 3, title: "Your Likes", icon: "heart-outline" },
    { id: 4, title: "Archive", icon: "archive-outline" },
    { id: 5, title: "Privacy Account", icon: "lock-closed-outline" },
    { id: 6, title: "Help", icon: "help-circle-outline" },
    { id: 7, title: "About", icon: "information-circle-outline" },
  ];

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => console.log("User logged out!") },
    ]);
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.optionContainer,
        { backgroundColor: isDark ? "#1c1c1c" : "#f7f7f7" },
      ]}
      onPress={() => console.log(`${item.title} pressed`)}
    >
      <Ionicons
        name={item.icon}
        size={24}
        color={isDark ? "#ffffff" : "#000000"}
        style={styles.icon}
      />
      <Text style={[styles.optionText, { color: isDark ? "#ffffff" : "#000000" }]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#ffffff" },
      ]}
    >
      <FlatList
        data={settingsOptions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListFooterComponent={
          <>
            <View style={[styles.themeToggleContainer, { backgroundColor: isDark ? "#1c1c1c" : "#f7f7f7" },
]}>
              <Text
                style={[
                  styles.optionText,
                  { color: isDark ? "#ffffff" : "#000000" },
                ]}
              >
                Dark Theme
              </Text>
              <Switch value={isDark} onValueChange={toggleTheme} />
            </View>

            <TouchableOpacity
              style={[
                styles.logoutButton,
                { backgroundColor: isDark ? "#1c1c1c" : "#f7f7f7" },
              ]}
              onPress={handleLogout}
            >
              <Ionicons
                name="log-out-outline"
                size={24}
                color={isDark ? "#ffffff" : "#000000"}
              />
              <Text
                style={[
                  styles.logoutText,
                  { color: isDark ? "#ffffff" : "#000000" },
                ]}
              >
                Logout
              </Text>
            </TouchableOpacity>
          </>
        }
      />
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  icon: {
    marginRight: 15,
  },
  optionText: {
    fontSize: 16,
  },
  themeToggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    // backgroundColor: "#f7f7f7",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
});