import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { IconCheck, IconX } from '~/components/icons';
import { useTheme } from '~/theme';
import { useReducedMotion } from '~/lib/motion';

export function LessonProgress({ completed, total }: { completed: number; total: number }) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(completed / Math.max(total, 1)));
  useEffect(() => {
    Animated.timing(progress, {
      toValue: completed / Math.max(total, 1),
      duration: reduced ? 0 : 220,
      useNativeDriver: false,
    }).start();
  }, [completed, total, reduced, progress]);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel="Atividades concluídas"
        accessibilityValue={{ min: 0, max: total, now: completed }}
        style={{
          flex: 1,
          height: 12,
          borderRadius: 6,
          backgroundColor: colors.elevated,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={{
            height: 12,
            borderRadius: 6,
            backgroundColor: colors.success,
            width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          }}
        />
      </View>
      <Text style={{ color: colors.muted, fontSize: 14, fontVariant: ['tabular-nums'] }}>
        {completed}/{total}
      </Text>
    </View>
  );
}

export function LessonOption({
  children,
  selected = false,
  disabled = false,
  marker,
  onPress,
}: {
  children: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  marker?: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 60,
        padding: 16,
        borderWidth: 2,
        borderRadius: 16,
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected
          ? colors.ownMessage
          : pressed
            ? colors.elevated
            : colors.background,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        opacity: disabled && !selected ? 0.6 : 1,
      })}
    >
      {marker && (
        <View
          style={{
            minWidth: 30,
            minHeight: 30,
            borderWidth: 1,
            borderColor: selected ? colors.primary : colors.border,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: selected ? colors.primary : colors.muted, fontWeight: '700' }}>
            {marker}
          </Text>
        </View>
      )}
      <Text
        style={{
          color: colors.text,
          flex: 1,
          fontSize: 17,
          lineHeight: 25,
          fontWeight: selected ? '600' : '400',
        }}
      >
        {children}
      </Text>
      {selected && <IconCheck size={22} color={colors.primary} />}
    </Pressable>
  );
}

export function LessonButton({
  label,
  onPress,
  busy = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  busy?: boolean;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || busy, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 56,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 16,
        backgroundColor: disabled ? colors.elevated : colors.success,
        opacity: busy || pressed ? 0.7 : 1,
        alignItems: 'center',
        justifyContent: 'center',
      })}
    >
      {busy ? (
        <ActivityIndicator color={colors.onSuccess} />
      ) : (
        <Text
          style={{
            color: disabled ? colors.muted : colors.onSuccess,
            fontSize: 17,
            lineHeight: 24,
            fontWeight: '800',
            textAlign: 'center',
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function LessonFeedback({ correct, children }: { correct: boolean; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityLiveRegion="polite"
      style={{
        padding: 16,
        borderRadius: 16,
        backgroundColor: correct ? colors.successSurface : colors.dangerSurface,
        gap: 8,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {correct ? (
          <IconCheck size={24} color={colors.success} />
        ) : (
          <IconX size={24} color={colors.danger} />
        )}
        <Text
          style={{
            color: correct ? colors.success : colors.danger,
            fontWeight: '800',
            fontSize: 19,
          }}
        >
          {correct ? 'Muito bem!' : 'Vamos tentar de novo'}
        </Text>
      </View>
      <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>{children}</Text>
    </View>
  );
}

export const lessonStyles = StyleSheet.create({
  title: { fontSize: 26, lineHeight: 33, fontWeight: '800' },
  group: { gap: 12 },
  footer: { gap: 12 },
});
