import { Component, type ErrorInfo, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Spacing, Typography } from "@/constants/design-tokens";
import { logError } from "@/lib/utils/error-logger";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // log the error and provide component stack info for debugging
    logError(error, {
      componentStack: errorInfo.componentStack ?? undefined,
      errorBoundary: "ErrorBoundary",
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Algo salió mal</Text>
          <Text style={styles.message}>
            Ocurrió un error inesperado. Por favor, intenta reiniciar la
            aplicación.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  message: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
});

export { ErrorBoundary };
