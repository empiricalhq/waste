import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "@/context/ToastContext";
import { Toast } from "./toast";

export function ToastViewport() {
  const { toasts } = useToast();
  const insets = useSafeAreaInsets();

  const topToasts = toasts.filter((t) => t.options.position === "top");
  const bottomToasts = toasts.filter((t) => t.options.position === "bottom");

  return (
    <>
      <View
        style={[
          styles.viewport,
          styles.topViewport,
          { paddingTop: insets.top + 10 },
        ]}
        pointerEvents="box-none"
      >
        {topToasts.map((toast, arrayIndex) => {
          const displayIndex = topToasts.length - 1 - arrayIndex;
          return <Toast key={toast.id} toast={toast} index={displayIndex} />;
        })}
      </View>
      <View
        style={[
          styles.viewport,
          styles.bottomViewport,
          { paddingBottom: insets.bottom + 10 },
        ]}
        pointerEvents="box-none"
      >
        {bottomToasts.map((toast, arrayIndex) => {
          const displayIndex = bottomToasts.length - 1 - arrayIndex;
          return <Toast key={toast.id} toast={toast} index={displayIndex} />;
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  viewport: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: 16,
  },
  topViewport: {
    top: 0,
    justifyContent: "flex-start",
  },
  bottomViewport: {
    bottom: 0,
    justifyContent: "flex-end",
  },
});
