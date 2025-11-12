import { StyleSheet, Text, View } from "react-native";
import { Header } from "@/components/shared/header";

function HelpScreen() {
  return (
    <View style={styles.container}>
      <Header title="Ayuda y Soporte" />
      <View style={styles.content}>
        <Text>La información de ayuda y contacto iría aquí.</Text>
      </View>
    </View>
  );
}

// export after non-export statements

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default HelpScreen;
