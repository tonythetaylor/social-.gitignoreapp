import React, { createContext, useContext, useState, ReactNode } from "react";
import { DefaultTheme, DarkTheme } from "@react-navigation/native";

// Create Theme Context
const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
});

// Custom Hook for Using Theme
export const useTheme = () => useContext(ThemeContext);

// Define Light and Dark Theme Configurations
export const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#ffffff",
    text: "#000000",
    primary: "#007bff",
    card: "#f7f7f7",
  },
};

export const DarkThemeConfig = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#121212",
    text: "#ffffff",
    primary: "#1f93ff",
    card: "#1c1c1c",
  },
};

// ThemeProvider Component
const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;