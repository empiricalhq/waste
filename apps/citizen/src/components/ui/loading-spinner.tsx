import React from "react";
import { View, ActivityIndicator, StyleSheet, ViewProps } from "react-native";
import { Colors } from "@/constants/design-tokens";

interface LoadingSpinnerProps extends ViewProps {
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullScreen = false, style }) => {
  return (
    <View style={[fullScreen ? styles.fullScreenContainer : styles.inlineContainer, style]}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inlineContainer: {
    padding: 20,
    alignItems: "center",
  },
});
