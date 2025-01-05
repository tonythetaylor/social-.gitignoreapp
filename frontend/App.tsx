import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Icon library for tabs
import * as SecureStore from 'expo-secure-store';

import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import FeedScreen from './src/screens/FeedScreen';
import SearchScreen from './src/screens/SearchScreen';
import CreatePostScreen from './src/screens/CreatePostScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import NotificationScreen from './src/screens/NotificationScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Define the TabNavigator for authenticated users
const TabNavigator = () => (
  <Tab.Navigator
    initialRouteName="Feed"  // Name of the first tab
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName: string = '';
        if (route.name === 'Feed') {
          iconName = 'home';
        } else if (route.name === 'Search') {
          iconName = 'search';
        } else if (route.name === 'Create') {
          iconName = 'paper-plane';
        } else if (route.name === 'Notification') {
            iconName = 'notifications';
        } else if (route.name === 'Profile') {
          iconName = 'person';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Feed" component={FeedScreen} />
    <Tab.Screen name="Search" component={SearchScreen} />
    <Tab.Screen name="Create" component={CreatePostScreen} />
    <Tab.Screen name="Notification" component={NotificationScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// Define the StackNavigator for authentication flow
const StackNavigator = () => (
  <Stack.Navigator initialRouteName="Login">
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
    <Stack.Screen 
      name="Home" 
      component={TabNavigator} 
      options={{ headerShown: false }} // Disable the header
    />
  </Stack.Navigator>
);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated (this example uses SecureStore)
    const checkAuthentication = async () => {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuthentication();
  }, []);

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <StackNavigator />
      ) : (
        // If not authenticated, render login/signup screens
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}