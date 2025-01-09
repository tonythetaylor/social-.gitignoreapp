import { View, Text, Switch, StyleSheet, StatusBar } from "react-native";
import ThemeProvider, { useTheme, LightTheme, DarkThemeConfig } from "../providers/ThemeProvider";


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

  export default ThemeToggle;

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