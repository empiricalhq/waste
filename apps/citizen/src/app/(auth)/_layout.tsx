import { Stack } from "expo-router";
import { memo } from "react";

export default memo(function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
});
