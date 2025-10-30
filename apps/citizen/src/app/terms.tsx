import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Header } from "@/components/shared/header";

export default function TermsScreen() {
  return (
    <View style={styles.container}>
      <Header title="Términos de Servicio" />
      <View style={styles.content}>
        <Text>Los términos de servicio irían aquí.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
});
