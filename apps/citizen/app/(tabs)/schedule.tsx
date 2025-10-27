import { useApp } from "@/contexts/AppContext";
import Colors from "@/constants/colors";
import { WASTE_TYPES, WasteType } from "@/constants/wasteTypes";
import { Check, ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function ScheduleScreen() {
  const { collections } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<WasteType | "all">("all");

  const filteredCollections =
    selectedFilter === "all" ? collections : collections.filter((c) => c.type === selectedFilter);

  const upcomingCollections = filteredCollections
    .filter((c) => !c.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastCollections = filteredCollections
    .filter((c) => c.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Schedule</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}>
        <TouchableOpacity
          style={[styles.filterChip, selectedFilter === "all" && styles.filterChipActive]}
          onPress={() => setSelectedFilter("all")}>
          <Text style={[styles.filterText, selectedFilter === "all" && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {(Object.keys(WASTE_TYPES) as WasteType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.filterChip, selectedFilter === type && styles.filterChipActive]}
            onPress={() => setSelectedFilter(type)}>
            <View style={[styles.filterDot, { backgroundColor: WASTE_TYPES[type].color }]} />
            <Text style={[styles.filterText, selectedFilter === type && styles.filterTextActive]}>
              {WASTE_TYPES[type].label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
          {upcomingCollections.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No upcoming collections</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {upcomingCollections.map((collection) => (
                <View key={collection.id} style={styles.card}>
                  <View style={styles.cardLeft}>
                    <View
                      style={[
                        styles.cardDot,
                        { backgroundColor: WASTE_TYPES[collection.type].color },
                      ]}
                    />
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardType}>{WASTE_TYPES[collection.type].label}</Text>
                      <View style={styles.cardDetails}>
                        <Text style={styles.cardDetail}>{formatDate(collection.date)}</Text>
                        <Text style={styles.cardDetailDot}>·</Text>
                        <Text style={styles.cardDetail}>{collection.time}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {pastCollections.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Past</Text>
            <View style={styles.list}>
              {pastCollections.map((collection) => (
                <View key={collection.id} style={[styles.card, styles.cardCompleted]}>
                  <View style={styles.cardLeft}>
                    <View style={styles.checkIcon}>
                      <Check size={12} color={Colors.light.textSecondary} />
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTypeCompleted}>
                        {WASTE_TYPES[collection.type].label}
                      </Text>
                      <View style={styles.cardDetails}>
                        <Text style={styles.cardDetail}>{formatDate(collection.date)}</Text>
                        <Text style={styles.cardDetailDot}>·</Text>
                        <Text style={styles.cardDetail}>{collection.time}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  filterScroll: {
    marginBottom: 24,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.light.cardBackground,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterChipActive: {
    backgroundColor: Colors.light.text,
    borderColor: Colors.light.text,
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  filterText: {
    fontSize: 13,
    color: Colors.light.text,
    fontWeight: "500" as const,
  },
  filterTextActive: {
    color: Colors.light.cardBackground,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
    marginBottom: 12,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  list: {
    gap: 8,
  },
  card: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cardCompleted: {
    opacity: 0.6,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.light.background,
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
  },
  cardType: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  cardTypeCompleted: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  cardDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardDetail: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  cardDetailDot: {
    fontSize: 13,
    color: Colors.light.textTertiary,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
  },
});
