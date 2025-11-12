import { Tabs } from "expo-router";
import { BookOpen, Camera, Home, LogIn, User } from "lucide-react-native";
import { Colors } from "@/constants/design-tokens";
import { useAuth } from "@/features/auth/hooks/use-auth";

function TabLayout() {
  const { user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        headerShown: false,
        tabBarStyle: { backgroundColor: Colors.cardBackground },
      }}
    >
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
      {user ? (
        <Tabs.Screen
          name="profile"
          options={{
            title: "Perfil",
            tabBarIcon: ({ color }) => <User color={color} />,
          }}
        />
      ) : (
        <Tabs.Screen
          name="profile"
          options={{
            title: "Ingresar",
            tabBarIcon: ({ color }) => <LogIn color={color} />,
            href: "/(auth)/login",
          }}
        />
      )}
      <Tabs.Screen name="schedule" options={{ href: null }} />
    </Tabs>
  );
}

export default TabLayout;
