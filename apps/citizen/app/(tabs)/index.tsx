import { useApp } from "@/contexts/AppContext";
import Colors from "@/constants/colors";
import { WASTE_TYPES } from "@/constants/wasteTypes";
import { Calendar, MapPin, MessageSquare } from "lucide-react-native";
import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const { trucks, collections } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const nextCollection = collections
    .filter((c) => !c.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const closestTruck = useMemo(() => {
    return trucks.reduce(
      (closest, truck) => (truck.eta < closest.eta ? truck : closest),
      trucks[0]
    );
  }, [trucks]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Waste Collection</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {nextCollection && (
          <View style={styles.nextCard}>
            <View style={styles.nextHeader}>
              <Text style={styles.nextLabel}>Next collection</Text>
              <View style={styles.nextBadge}>
                <View
                  style={[
                    styles.badgeDot,
                    { backgroundColor: WASTE_TYPES[nextCollection.type].color },
                  ]}
                />
                <Text style={styles.badgeText}>{WASTE_TYPES[nextCollection.type].label}</Text>
              </View>
            </View>
            <Text style={styles.nextDate}>
              {formatDate(nextCollection.date)} at {nextCollection.time}
            </Text>
            <Text style={styles.nextHint}>
              Place your {WASTE_TYPES[nextCollection.type].label.toLowerCase()} bin outside before
              collection time
            </Text>
          </View>
        )}

        {closestTruck && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Truck nearby</Text>
            <TouchableOpacity style={styles.truckCard} activeOpacity={0.7}>
              <View style={styles.truckLeft}>
                <View
                  style={[
                    styles.truckDot,
                    { backgroundColor: WASTE_TYPES[closestTruck.type].color },
                  ]}
                />
                <View style={styles.truckInfo}>
                  <Text style={styles.truckType}>
                    {WASTE_TYPES[closestTruck.type].label} collection
                  </Text>
                  <Text style={styles.truckRoute}>{closestTruck.route}</Text>
                </View>
              </View>
              <View style={styles.truckEta}>
                <Text style={styles.etaNumber}>{closestTruck.eta}</Text>
                <Text style={styles.etaLabel}>min</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
              <MapPin size={18} color={Colors.light.text} />
              <Text style={styles.actionButtonText}>Track on map</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push("/schedule")}
              activeOpacity={0.7}>
              <Calendar size={20} color={Colors.light.text} />
              <Text style={styles.actionCardText}>Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
              <MessageSquare size={20} color={Colors.light.text} />
              <Text style={styles.actionCardText}>Contact</Text>
            </TouchableOpacity>
          </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "600" as const,
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
  },
  nextCard: {
    backgroundColor: Colors.light.cardBackground,
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  nextHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  nextLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: "500" as const,
  },
  nextBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.light.background,
    borderRadius: 6,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 13,
    color: Colors.light.text,
    fontWeight: "500" as const,
  },
  nextDate: {
    fontSize: 18,
    color: Colors.light.text,
    fontWeight: "600" as const,
    marginBottom: 8,
  },
  nextHint: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  truckCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  truckLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  truckDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  truckInfo: {
    flex: 1,
  },
  truckType: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  truckRoute: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  truckEta: {
    alignItems: "flex-end",
  },
  etaNumber: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  etaLabel: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.cardBackground,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginTop: 8,
  },
  actionButtonText: {
    fontSize: 15,
    color: Colors.light.text,
    fontWeight: "500" as const,
  },
  actionGrid: {
    flexDirection: "row",
    gap: 8,
  },
  actionCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.cardBackground,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  actionCardText: {
    fontSize: 15,
    color: Colors.light.text,
    fontWeight: "500" as const,
  },
});
