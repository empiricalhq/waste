import { StyleSheet, Text, View } from "react-native";
import { Header } from "@/components/shared/header";

function TruckMapScreen() {
  return (
    <View style={styles.container}>
      <Header title="Mapa de Camiones" />
      <View style={styles.content}>
        <Text>El mapa en tiempo real iría aquí.</Text>
      </View>
    </View>
  );
}

// export after non-export statements

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default TruckMapScreen;
