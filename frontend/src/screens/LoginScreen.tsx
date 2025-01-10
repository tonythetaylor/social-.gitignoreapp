import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { saveToken } from "../utils/setUserToken";

const LoginScreen = ({ navigation }: any) => {
  // Default email and password for testing
  const defaultEmail = "user@example.com";
  const defaultPassword = "password123";

  const [email, setEmail] = useState(defaultEmail); // Set default email
  const [password, setPassword] = useState(defaultPassword); // Set default password
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post("https://44.221.106.179/auth/login", {
        email,
        password,
      });
  
      console.log("Response: ", response.data);
  
      if (response.data.token) {
        await saveToken("authToken", response.data.token); // Save the token securely
        navigation.navigate("Home");
      } else {
        setError("Unexpected server response.");
      }
    } catch (err: any) {
      console.error("Login error: ", err.response?.data || err.message);
      setError(err.response?.data?.error || "Login failed. Please check your credentials.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.signUpLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  error: {
    color: "red",
    marginBottom: 15,
    fontSize: 14,
  },
  button: {
    width: "100%",
    padding: 15,
    backgroundColor: "#007bff",
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  signUpContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  signUpText: {
    fontSize: 14,
    color: "#333",
  },
  signUpLink: {
    fontSize: 14,
    color: "#007bff",
    fontWeight: "bold",
  },
});

export default LoginScreen;
