import { ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import IconArrowLeft from '@tabler/icons-react-native/IconArrowLeft';
import IconChevronRight from '@tabler/icons-react-native/IconChevronRight';
import IconWifiOff from '@tabler/icons-react-native/IconWifiOff';
import { useNetInfo } from '@react-native-community/netinfo';
import { colors as c } from '../theme';
import { errorMessage } from '../lib/api';
import { config } from '../lib/config';
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background },
  content: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  text: { fontSize: 16, lineHeight: 24, color: c.text },
  muted: { fontSize: 14, lineHeight: 21, color: c.muted },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700', color: c.text },
  heading: { fontSize: 20, lineHeight: 27, fontWeight: '700', color: c.text },
  panel: { backgroundColor: c.surface, padding: 16, borderRadius: 16, gap: 12 },
  input: {
    minHeight: 52,
    color: c.text,
    fontSize: 16,
    padding: 14,
    borderColor: c.border,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: c.surface,
  },
  separator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.border,
    paddingVertical: 16,
  },
});
export function Label({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return <Text style={muted ? styles.muted : styles.text}>{children}</Text>;
}
export function Heading({ children }: { children: ReactNode }) {
  return (
    <Text accessibilityRole="header" style={styles.heading}>
      {children}
    </Text>
  );
}
export function Screen({
  title,
  children,
  scroll = true,
  back = false,
  actions,
}: {
  title: string;
  children: ReactNode;
  scroll?: boolean;
  back?: boolean;
  actions?: ReactNode;
}) {
  const network = useNetInfo();
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View
        style={[
          styles.between,
          {
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderBottomColor: c.border,
            borderBottomWidth: StyleSheet.hairlineWidth,
          },
        ]}
      >
        <View style={[styles.row, { flexShrink: 1 }]}>
          {back && (
            <IconButton
              label="Voltar"
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
              icon={<IconArrowLeft color={c.text} />}
            />
          )}
          <Text accessibilityRole="header" style={styles.heading}>
            {title}
          </Text>
        </View>
        <View style={styles.row}>{actions}</View>
      </View>
      {network.isConnected === false && (
        <View style={[styles.row, { padding: 12, backgroundColor: c.surface }]}>
          <IconWifiOff color={c.warning} size={20} />
          <Label>Sem conexão. Exibindo os dados já carregados.</Label>
        </View>
      )}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scroll ? (
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
            {children}
          </ScrollView>
        ) : (
          children
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function Button({
  label,
  onPress,
  busy = false,
  secondary = false,
  disabled = false,
  danger = false,
}: {
  label: string;
  onPress: () => void;
  busy?: boolean;
  secondary?: boolean;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || busy, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: secondary ? c.elevated : c.primary,
        opacity: disabled || busy?.valueOf() ? 0.55 : pressed ? 0.75 : 1,
      })}
    >
      {busy ? (
        <ActivityIndicator color={c.text} />
      ) : (
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: danger ? c.danger : c.onPrimary,
            textAlign: 'center',
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
export function IconButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        minWidth: 48,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.6 : 1,
      })}
    >
      {icon}
    </Pressable>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 8 }}>
      <Label>{label}</Label>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={c.muted}
        selectionColor={c.primary}
        autoCapitalize="none"
        {...props}
        style={[
          styles.input,
          props.multiline && { minHeight: 130, textAlignVertical: 'top' },
          props.style,
        ]}
      />
    </View>
  );
}
export function Notice({ error, retry }: { error?: unknown; retry?: () => void }) {
  return (
    <View accessibilityLiveRegion="polite" style={[styles.panel, { margin: 16 }]}>
      <Heading>{error ? 'Não foi possível carregar' : 'Nada por aqui ainda'}</Heading>
      <Label muted>
        {error ? errorMessage(error) : 'Quando houver conteúdo, ele aparecerá aqui.'}
      </Label>
      {retry && <Button label="Tentar novamente" secondary onPress={retry} />}
    </View>
  );
}
export function Loading() {
  return (
    <View accessibilityLabel="Carregando" style={{ padding: 32 }}>
      <ActivityIndicator size="large" color={c.primary} />
    </View>
  );
}
export function AsyncState({
  query,
  children,
}: {
  query: { isPending: boolean; error: unknown; data: unknown; refetch: () => unknown };
  children: ReactNode;
}) {
  if (query.isPending) return <Loading />;
  if (query.error && !query.data)
    return <Notice error={query.error} retry={() => query.refetch()} />;
  return (
    <>
      {query.error && <Notice error={query.error} retry={() => query.refetch()} />} {children}
    </>
  );
}
export function RowLink({
  title,
  subtitle,
  onPress,
  leading,
}: {
  title: string;
  subtitle?: string;
  onPress: () => void;
  leading?: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.row, styles.separator, { minHeight: 64 }]}
    >
      {leading}
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={[styles.text, { fontWeight: '600' }]}>{title}</Text>
        {subtitle && <Label muted>{subtitle}</Label>}
      </View>
      <IconChevronRight color={c.muted} size={20} />
    </Pressable>
  );
}
export function Avatar({
  uri,
  name,
  size = 42,
}: {
  uri?: string | null;
  name: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  return uri && !failed ? (
    <Image
      accessibilityLabel={'Avatar de ' + name}
      source={{ uri: uri.startsWith('/') ? config.apiUrl + uri : uri }}
      onError={() => setFailed(true)}
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c.surface }}
    />
  ) : (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: c.elevated,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: c.text, fontSize: size / 2.3, fontWeight: '700' }}>
        {name[0]?.toUpperCase()}
      </Text>
    </View>
  );
}
export function Choice({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8 }}
    >
      {options.map((o) => (
        <Pressable
          key={o.value}
          accessibilityRole="button"
          accessibilityState={{ selected: value === o.value }}
          onPress={() => onChange(o.value)}
          style={{
            minHeight: 48,
            paddingHorizontal: 16,
            justifyContent: 'center',
            borderBottomWidth: 2,
            borderBottomColor: value === o.value ? c.primary : 'transparent',
          }}
        >
          <Text
            style={{ fontSize: 15, fontWeight: '600', color: value === o.value ? c.text : c.muted }}
          >
            {o.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
export const confirm = (title: string, message: string, action: () => void) => {
  if (Platform.OS === 'web') {
    if (globalThis.confirm(message)) action();
  } else
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', style: 'destructive', onPress: action },
    ]);
};
