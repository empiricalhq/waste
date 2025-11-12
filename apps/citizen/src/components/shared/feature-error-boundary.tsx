import { Component, type ErrorInfo, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/button";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "@/constants/design-tokens";
import { logError } from "@/lib/utils/error-logger";

interface Props {
  children: ReactNode;
  featureName: string;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Feature-level error boundary that catches errors within a specific feature
 * and provides a fallback UI with retry functionality.
 */
class FeatureErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError(error, {
      feature: this.props.featureName,
      componentStack: errorInfo.componentStack ?? undefined,
      errorBoundary: "FeatureErrorBoundary",
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      const { featureName, fallbackTitle, fallbackMessage } = this.props;

      return (
        <View style={styles.container}>
          <Text style={styles.title}>
            {fallbackTitle || "Error en la función"}
          </Text>
          <Text style={styles.message}>
            {fallbackMessage ||
              `Ocurrió un error en ${featureName}. Por favor, intenta de nuevo.`}
          </Text>
          {this.state.error && __DEV__ && (
            <View style={styles.errorDetails}>
              <Text style={styles.errorText}>{this.state.error.message}</Text>
            </View>
          )}
          <Button
            title="Reintentar"
            onPress={this.handleReset}
            variant="outline"
            style={styles.retryButton}
          />
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
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  message: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  errorDetails: {
    backgroundColor: Colors.cardBackground,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    maxWidth: "100%",
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.error,
    fontFamily: "monospace",
  },
  retryButton: {
    minWidth: 140,
  },
});

export { FeatureErrorBoundary };
