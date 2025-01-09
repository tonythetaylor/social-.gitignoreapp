import React, { createContext, useContext, useState } from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { View, Text, Switch, StyleSheet, StatusBar } from "react-native";
import ThemeProvider, { useTheme, LightTheme, DarkThemeConfig } from "./src/providers/ThemeProvider";

// Screens
import LoginScreen from "./src/screens/LoginScreen";
import SignupScreen from "./src/screens/SignupScreen";
import FeedScreen from "./src/screens/FeedScreen";
import SearchScreen from "./src/screens/SearchScreen";
import CreatePostScreen from "./src/screens/CreatePostScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import NotificationScreen from "./src/screens/NotificationScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator
const TabNavigator = () => {
  const { isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = "";
          switch (route.name) {
            case "Feed":
              iconName = "home";
              break;
            case "Search":
              iconName = "search";
              break;
            case "Create":
              iconName = "add-circle";
              break;
            case "Notifications":
              iconName = "notifications";
              break;
            case "Profile":
              iconName = "person";
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: {
          backgroundColor: isDark ? "#1c1c1c" : "#ffffff",
        },
        tabBarActiveTintColor: isDark ? "#1f93ff" : "#007bff",
        tabBarInactiveTintColor: isDark ? "#888" : "#888",
        headerStyle: {
          backgroundColor: isDark ? "#1c1c1c" : "#ffffff", // Header background
        },
        headerTintColor: isDark ? "#ffffff" : "#000000", // Header text and icons
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Create" component={CreatePostScreen} />
      <Tab.Screen name="Notifications" component={NotificationScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Stack Navigator
const StackNavigator = () => {
  const { isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? "#1c1c1c" : "#ffffff", // Header background
        },
        headerTintColor: isDark ? "#ffffff" : "#000000", // Header text and icons
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen
        name="Home"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

// Main App
export default function App() {
  const { isDark } = useTheme();

  return (
    <ThemeProvider>
       <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"} // Adjust status bar style
        backgroundColor={isDark ? "#1c1c1c" : "#ffffff"} // Adjust status bar background
      />
      <NavigationContainer theme={isDark ? DarkThemeConfig : LightTheme}>
        <StackNavigator />
        {/* <ThemeToggle /> */}
      </NavigationContainer>
    </ThemeProvider>
  );
}

// Theme Toggle Component
const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <View style={styles.themeToggle}>
      <Text style={{ color: isDark ? "#fff" : "#000", marginRight: 10 }}>
        {isDark ? "Dark Mode" : "Light Mode"}
      </Text>
      <Switch value={isDark} onValueChange={toggleTheme} />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  themeToggle: {
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 50,
  },
});