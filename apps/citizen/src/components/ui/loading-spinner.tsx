import type React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  type ViewProps,
} from "react-native";
import { Colors, Spacing } from "@/constants/design-tokens";

interface LoadingSpinnerProps extends ViewProps {
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = false,
  style,
}) => {
  return (
    <View
      style={[
        fullScreen ? styles.fullScreenContainer : styles.inlineContainer,
        style,
      ]}
    >
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
    padding: Spacing.xl,
    alignItems: "center",
  },
});
