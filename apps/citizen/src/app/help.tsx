import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Header } from "@/components/shared/header";

export default function HelpScreen() {
  return (
    <View style={styles.container}>
      <Header title="Ayuda y Soporte" />
      <View style={styles.content}>
        <Text>La información de ayuda y contacto iría aquí.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
});
