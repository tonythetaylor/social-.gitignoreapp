import * as SecureStore from "expo-secure-store";

const isWeb = typeof window !== "undefined";

export const saveToken = async (key: string, value: string) => {
  try {
    if (isWeb) {
      // Use localStorage for web
      localStorage.setItem(key, value);
    } else {
      // Use SecureStore for mobile
      await SecureStore.setItemAsync(key, value);
    }
  } catch (error) {
    console.error(`Failed to save token: ${error}`);
    throw new Error("Unable to save the token. Please try again.");
  }
};

export const getToken = async () => {
  try {
    if (isWeb) {
      // Use localStorage for web
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Token not found in localStorage.");
      return token;
    } else {
      // Use SecureStore for mobile
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) throw new Error("Token not found in SecureStore.");
      return token;
    }
  } catch (error) {
    console.error(`Failed to retrieve token: ${error}`);
    throw new Error("Unable to retrieve the token. Please log in again.");
  }
};