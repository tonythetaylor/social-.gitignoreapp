import * as SecureStore from "expo-secure-store";

const isWeb = typeof window !== "undefined";

export const getToken = async () => {
  if (isWeb) {
    // Use localStorage for web
    localStorage.getItemItem("authToken");
  } else {
    // Use SecureStore for mobile
    await SecureStore.getItemAsync("authToken");
  }
};

export const getUserInfoFromToken = async () => {
  const token = await SecureStore.getItemAsync("authToken");

  if (!token) {
    return null; // User is not logged in
  }

  const tokenData = JSON.parse(atob(token.split(".")[1])); // Decode JWT
  return {
    username: tokenData.username,
    profilePicture: tokenData.profilePicture,
  };
};