import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Header } from "@/components/shared/header";

export default function PrivacyScreen() {
  return (
    <View style={styles.container}>
      <Header title="Política de Privacidad" />
      <View style={styles.content}>
        <Text>El texto de la política de privacidad iría aquí.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
});
