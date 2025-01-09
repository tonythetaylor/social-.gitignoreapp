import { SafeAreaView, StyleSheet } from "react-native";
import { useTheme } from "../providers/ThemeProvider";

const ThemedSafeAreaView = ({ children }: any) => {
  const { isDark } = useTheme();

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? "#1c1c1c" : "#ffffff" },
      ]}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});

export default ThemedSafeAreaView;