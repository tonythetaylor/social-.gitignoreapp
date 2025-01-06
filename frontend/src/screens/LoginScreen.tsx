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

const apiUrl = process.env.REACT_APP_API_URL;

const LoginScreen = ({ navigation }: any) => {
  // Default email and password for testing
  const defaultEmail = "user@example.com";
  const defaultPassword = "password123";

  const [email, setEmail] = useState(defaultEmail); // Set default email
  const [password, setPassword] = useState(defaultPassword); // Set default password
  const [error, setError] = useState("");
 
  const handleLogin = async () => {
    try {
      const response = await axios.post(`http://10.0.0.151:3005/auth/login`, {
        email,
        password,
      });
      await SecureStore.setItemAsync("authToken", response.data.token); // Store token securely
      navigation.navigate("Home");
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {/* Email input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      {/* Error message */}
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Login Button */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Sign up link */}
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
