import { Tabs } from "expo-router";
import React from "react";
import { Colors } from "@/constants/design-tokens";
import { Home, BookOpen, Camera, User } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        headerShown: false,
        tabBarStyle: { backgroundColor: Colors.cardBackground },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => <Home color={color} />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: "Aprender",
          tabBarIcon: ({ color }) => <BookOpen color={color} />,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: "Reportar",
          tabBarIcon: ({ color }) => <Camera color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => <User color={color} />,
        }}
      />
      <Tabs.Screen name="schedule" options={{ href: null }} />
    </Tabs>
  );
}
