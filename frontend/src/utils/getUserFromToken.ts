import * as SecureStore from "expo-secure-store";

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