import { StyleSheet, Text, View } from "react-native";
import { Header } from "@/components/shared/header";

function TermsScreen() {
  return (
    <View style={styles.container}>
      <Header title="Términos de Servicio" />
      <View style={styles.content}>
        <Text>Los términos de servicio irían aquí.</Text>
      </View>
    </View>
  );
}

// export after non-export statements

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default TermsScreen;
