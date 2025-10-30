import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Header } from "@/components/shared/header";

export default function TruckMapScreen() {
  return (
    <View style={styles.container}>
      <Header title="Mapa de Camiones" />
      <View style={styles.content}>
        <Text>El mapa en tiempo real iría aquí.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
});
