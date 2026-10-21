import type { ReactNode, Ref } from 'react';
import { ActivityIndicator, Platform, Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSend } from './icons';
import { useTheme } from '../theme';

/** Kept outside the scroll view, inside Screen's keyboard-avoiding area. */
export function CompactComposer({
  value,
  onChangeText,
  onSend,
  placeholder,
  sendLabel,
  disabled = false,
  editable = true,
  busy = false,
  maxLength = 5000,
  leading,
  actions,
  inputRef,
}: {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  placeholder: string;
  sendLabel: string;
  disabled?: boolean;
  editable?: boolean;
  busy?: boolean;
  maxLength?: number;
  leading?: ReactNode;
  actions?: ReactNode;
  inputRef?: Ref<TextInput>;
}) {
  const { colors: c } = useTheme();
  const insets = useSafeAreaInsets();
  const unavailable = disabled || busy;
  return (
    <View
      style={{
        backgroundColor: c.background,
        width: '100%',
        maxWidth: 760,
        alignSelf: 'center',
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: Math.max(insets.bottom, 10),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          borderRadius: 28,
          backgroundColor: c.composer,
          borderWidth: 1,
          borderColor: c.socialBorder,
          padding: 3,
          gap: 2,
        }}
      >
        {leading && (
          <View style={{ minHeight: 48, justifyContent: 'center', paddingHorizontal: 5 }}>
            {leading}
          </View>
        )}
        <TextInput
          {...(Platform.OS === 'web' ? { rows: 1 } : {})}
          ref={inputRef}
          accessibilityLabel={placeholder}
          placeholder={placeholder}
          placeholderTextColor={c.muted}
          selectionColor={c.primary}
          value={value}
          onChangeText={onChangeText}
          editable={editable && !busy}
          multiline
          maxLength={maxLength}
          scrollEnabled
          textAlignVertical="center"
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 48,
            maxHeight: 120,
            paddingHorizontal: 6,
            paddingVertical: 12,
            fontSize: 16,
            lineHeight: 23,
            color: c.text,
          }}
        />
        {actions && <View style={{ flexDirection: 'row', alignItems: 'center' }}>{actions}</View>}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={sendLabel}
          accessibilityState={{ disabled: unavailable, busy }}
          disabled={unavailable}
          onPress={onSend}
          style={({ pressed }) => ({
            width: 48,
            height: 48,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 24,
            backgroundColor: unavailable ? 'transparent' : c.primary,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          {busy ? (
            <ActivityIndicator color={c.muted} accessibilityLabel="Enviando" />
          ) : (
            <IconSend size={22} strokeWidth={1.8} color={unavailable ? c.muted : c.onPrimary} />
          )}
        </Pressable>
      </View>
    </View>
  );
}
