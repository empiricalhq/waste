import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Hook to detect if user has enabled "Reduce Motion" in system settings
 * When enabled, animations should be simplified or disabled
 * @returns boolean indicating if reduced motion is enabled
 */
export const useReducedMotion = (): boolean => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check initial state
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);

    return () => subscription.remove();
  }, []);

  return reducedMotion;
};
