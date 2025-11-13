import { useEffect, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";

/**
 * Returns true when app is in foreground/active state
 * Used to pause polling when app is backgrounded
 */
export function useAppState(): boolean {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (state: AppStateStatus) => {
        setIsActive(state === "active");
      },
    );

    return () => subscription.remove();
  }, []);

  return isActive;
}
