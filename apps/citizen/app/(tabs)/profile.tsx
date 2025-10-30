import Colors from "@/constants/colors";
import { getUser, updateUserSettings } from "@/services/api";
import { User } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, ChevronRight } from "lucide-react-native";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["user"],
    queryFn: getUser,
  });

  const { mutate: updateSettings } = useMutation({
    mutationFn: updateUserSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const toggleNotifications = () => {
    if (user) {
      updateSettings({ notificationsEnabled: !user.settings.notificationsEnabled });
    }
  };

  const accuracy =
    user && user.progress.totalQuestions > 0
      ? Math.round((user.progress.correctAnswers / user.progress.totalQuestions) * 100)
      : 0;

  if (isLoading || !user) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={Colors.light.text} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.progress.streak}</Text>
            <Text style={styles.statLabel}>días de racha</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{accuracy}%</Text>
            <Text style={styles.statLabel}>precisión</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.progress.totalQuestions}</Text>
            <Text style={styles.statLabel}>tests</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ajustes</Text>
          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Bell size={20} color={Colors.light.text} />
                <Text style={styles.settingTitle}>Notificaciones</Text>
              </View>
              <Switch
                value={user.settings.notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{
                  false: Colors.light.border,
                  true: Colors.light.text,
                }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acerca de</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingTitle}>Ayuda y soporte</Text>
              <ChevronRight size={20} color={Colors.light.textSecondary} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingTitle}>Política de privacidad</Text>
              <ChevronRight size={20} color={Colors.light.textSecondary} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingTitle}>Términos de servicio</Text>
              <ChevronRight size={20} color={Colors.light.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Versión 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: Colors.light.cardBackground,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.light.border,
    marginHorizontal: 16,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.light.textSecondary,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingsList: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.light.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginLeft: 16,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
});
