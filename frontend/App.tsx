import React, { useEffect } from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { StatusBar, Platform } from "react-native";
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
          const icons = {
            Feed: "home",
            Search: "search",
            Create: "add-circle",
            Notifications: "notifications",
            Profile: "person",
          } as any;
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarStyle: {
          backgroundColor: isDark ? "#1c1c1c" : "#ffffff",
        },
        tabBarActiveTintColor: isDark ? "#1f93ff" : "#007bff",
        tabBarInactiveTintColor: isDark ? "#888" : "#888",
        headerStyle: {
          backgroundColor: isDark ? "#1c1c1c" : "#ffffff",
        },
        headerTintColor: isDark ? "#ffffff" : "#000000",
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
          backgroundColor: isDark ? "#1c1c1c" : "#ffffff",
        },
        headerTintColor: isDark ? "#ffffff" : "#000000",
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

// Main App Component
export default function App() {
  const { isDark } = useTheme();

  useEffect(() => {
    StatusBar.setBarStyle(isDark ? "light-content" : "dark-content", true);
    if (Platform.OS === "android") {
      StatusBar.setBackgroundColor(isDark ? "#1c1c1c" : "#ffffff", true);
    }
  }, [isDark]);

  return (
    <ThemeProvider>
      <NavigationContainer theme={isDark ? DarkThemeConfig : LightTheme}>
        <StackNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}