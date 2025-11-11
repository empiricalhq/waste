import * as Haptics from "expo-haptics";

// light haptic feedback for selections and taps
export const hapticSelection = async (): Promise<void> => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Haptics may not be available on all devices
  }
};

// Success haptic feedback for correct answers
export const hapticSuccess = async (): Promise<void> => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // haptics may not be available on all devices
  }
};

// Error haptic feedback for incorrect answers
export const hapticError = async (): Promise<void> => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {
    // Haptics may not be available on all devices
  }
};

// Warning haptic feedback for important notifications
export const hapticWarning = async (): Promise<void> => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {
    // Haptics may not be available on all devices
  }
};
