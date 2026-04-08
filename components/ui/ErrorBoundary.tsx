import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>App Error</Text>
          <Text style={styles.subtitle}>The app crashed. Details below:</Text>
          <ScrollView style={styles.scroll}>
            <Text style={styles.errorName}>{this.state.error?.name}</Text>
            <Text style={styles.errorMessage}>{this.state.error?.message}</Text>
            <Text style={styles.stack}>{this.state.error?.stack}</Text>
          </ScrollView>
          <Pressable
            style={styles.button}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1e",
    padding: 24,
    paddingTop: 80,
  },
  title: {
    color: "#ef4444",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 16,
  },
  scroll: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorName: {
    color: "#fb923c",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  errorMessage: {
    color: "#ffffff",
    fontSize: 14,
    marginBottom: 12,
  },
  stack: {
    color: "#888",
    fontSize: 11,
    lineHeight: 16,
  },
  button: {
    backgroundColor: "#7dd3fc",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#0f0f1e",
    fontSize: 16,
    fontWeight: "bold",
  },
});
