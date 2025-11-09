import type React from 'react';
import { useEffect } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ANIMATION_DURATIONS, SPRING_CONFIGS } from '@/constants/animations';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/design-tokens';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

interface QuizCompletionModalProps {
  visible: boolean;
  score: number;
  total: number;
  isAuthenticated: boolean;
  onContinue: () => void;
  onSignUp: () => void;
}

export const QuizCompletionModal: React.FC<QuizCompletionModalProps> = ({
  visible,
  score,
  total,
  isAuthenticated,
  onContinue,
  onSignUp,
}) => {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      if (reducedMotion) {
        scale.value = 1;
        opacity.value = 1;
      } else {
        scale.value = withSpring(1, SPRING_CONFIGS.DEFAULT);
        opacity.value = withTiming(1, { duration: ANIMATION_DURATIONS.NORMAL });
      }
    } else {
      scale.value = 0.8;
      opacity.value = 0;
    }
  }, [visible, reducedMotion, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const percentage = Math.round((score / total) * 100);
  const isGoodScore = percentage >= 70;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onContinue}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.modal, animatedStyle]}>
          <Text variant="heading1" weight="bold" align="center" style={styles.title}>
            {isGoodScore ? '¡Excelente!' : 'Quiz terminado'}
          </Text>

          <View style={styles.scoreContainer}>
            <Text variant="heading2" weight="bold" color="primary" align="center">
              {score}/{total}
            </Text>
            <Text variant="bodyLarge" color="secondary" align="center">
              {percentage}% correctas
            </Text>
          </View>

          {isGoodScore && (
            <Text variant="body" color="secondary" align="center" style={styles.message}>
              ¡Sigue así! Estás aprendiendo mucho sobre reciclaje.
            </Text>
          )}

          {!isAuthenticated && (
            <View style={styles.signUpPrompt}>
              <Text variant="body" color="secondary" align="center">
                ¿Quieres guardar tu progreso?
              </Text>
            </View>
          )}

          <View style={styles.actions}>
            {!isAuthenticated && (
              <Button title="Crear cuenta" onPress={onSignUp} style={styles.button} />
            )}
            <Button
              title={isAuthenticated ? 'Continuar' : 'Más tarde'}
              onPress={onContinue}
              variant={isAuthenticated ? 'primary' : 'secondary'}
              style={styles.button}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modal: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...Shadows.lg,
  },
  title: {
    marginBottom: Spacing.lg,
  },
  scoreContainer: {
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  message: {
    marginBottom: Spacing.lg,
  },
  signUpPrompt: {
    marginBottom: Spacing.md,
  },
  actions: {
    gap: Spacing.md,
  },
  button: {
    width: '100%',
  },
});
