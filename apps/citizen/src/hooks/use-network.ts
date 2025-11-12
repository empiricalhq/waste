import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

export function useNetwork() {
  const [isOffline, setIsOffline] = useState(false);
  const [isWifi, setIsWifi] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
      setIsWifi(state.type === "wifi");
    });
    return unsubscribe;
  }, []);

  return { isOffline, isWifi };
}
