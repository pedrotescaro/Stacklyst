import { ReactNode, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  AccessibilityInfo,
  Animated,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  IconArrowLeft,
  IconChevronRight,
  IconWifiOff,
  IconMessageCircle,
  IconAlertCircle,
} from '~/components/icons';
import { useNetInfo } from '@react-native-community/netinfo';
import { colors, useTheme, type Palette, type as typography } from '../theme';
import { useDrawer } from '../lib/navigation';
import { useMe, useSession } from '../lib/session';
import { errorMessage } from '../lib/api';
import { config } from '../lib/config';
import { BrandMark } from './BrandMark';
import { AvatarFrame } from './AvatarFrame';

function createStyles(c: Palette) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    content: {
      width: '100%',
      maxWidth: 760,
      alignSelf: 'center',
      padding: 20,
      gap: 20,
      paddingBottom: 32,
      flexGrow: 1,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    between: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    text: { ...typography.body, color: c.text },
    muted: { ...typography.secondary, color: c.muted },
    title: { ...typography.title, color: c.text },
    heading: { ...typography.heading, color: c.text },
    panel: { backgroundColor: c.surface, padding: 16, borderRadius: 12, gap: 12 },
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
}
export const styles = createStyles(colors);
export function useUIStyles() {
  const { colors: c } = useTheme();
  return useMemo(() => createStyles(c), [c]);
}
export function Label({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  const s = useUIStyles();
  return <Text style={muted ? s.muted : s.text}>{children}</Text>;
}
export function Heading({ children }: { children: ReactNode }) {
  const s = useUIStyles();
  return (
    <Text accessibilityRole="header" style={s.heading}>
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
  onRefresh,
  refreshing = false,
  brand = false,
  footer,
}: {
  title: string;
  children: ReactNode;
  scroll?: boolean;
  back?: boolean;
  actions?: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  brand?: boolean;
  footer?: ReactNode;
}) {
  const { colors: c } = useTheme();
  const s = useUIStyles();
  const network = useNetInfo();
  const insets = useSafeAreaInsets();
  const { openDrawer } = useDrawer();
  const { session, isPreview } = useSession();
  const me = useMe();
  const hasMenu = !back && (!!session || isPreview);
  return (
    <SafeAreaView style={s.screen} edges={['top', 'left', 'right']}>
      <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border }}>
        <View
          style={[
            s.between,
            {
              minHeight: 60,
              paddingHorizontal: 12,
              width: '100%',
              maxWidth: 760,
              alignSelf: 'center',
            },
          ]}
        >
          {back ? (
            <IconButton
              label="Voltar"
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
              icon={<IconArrowLeft color={c.text} size={24} />}
            />
          ) : hasMenu ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir menu da conta"
              onPress={openDrawer}
              style={({ pressed }) => ({
                minWidth: 48,
                minHeight: 48,
                justifyContent: 'center',
                alignItems: 'center',
                opacity: pressed ? 0.65 : 1,
              })}
            >
              <Avatar
                uri={me.data?.avatar_url}
                name={me.data?.username ?? 'S'}
                profileStyle={me.data?.avatar_config?.profileStyle}
                size={34}
              />
            </Pressable>
          ) : null}
          {brand ? (
            <View
              accessibilityRole="header"
              accessibilityLabel={title}
              style={{ flex: 1, alignItems: 'center', marginRight: hasMenu && !actions ? 48 : 0 }}
            >
              <BrandMark width={27} wordmark />
            </View>
          ) : (
            <Text
              accessibilityRole="header"
              numberOfLines={1}
              style={[
                s.heading,
                {
                  flex: 1,
                  textAlign: hasMenu && !actions ? 'center' : 'left',
                  marginRight: hasMenu && !actions ? 48 : 0,
                },
              ]}
            >
              {title}
            </Text>
          )}
          {actions && <View style={s.row}>{actions}</View>}
        </View>
      </View>
      {isPreview && (
        <View
          style={{
            backgroundColor: c.surface,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderColor: c.border,
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Text style={{ color: c.muted, fontSize: 12, textAlign: 'center' }}>
            Demonstração · dados ilustrativos · somente leitura
          </Text>
        </View>
      )}
      {network.isConnected === false && (
        <View
          accessibilityLiveRegion="polite"
          style={[s.row, { padding: 12, backgroundColor: c.surface }]}
        >
          <IconWifiOff color={c.warning} size={20} />
          <Text style={[s.muted, { flex: 1 }]}>
            Sem conexão. Os dados já carregados continuam disponíveis.
          </Text>
        </View>
      )}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scroll ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={[s.content, { paddingBottom: Math.max(32, insets.bottom + 16) }]}
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={c.primary}
                  colors={[c.primary]}
                />
              ) : undefined
            }
          >
            {children}
          </ScrollView>
        ) : (
          children
        )}
        {footer && (
          <View
            style={{
              borderTopWidth: StyleSheet.hairlineWidth,
              borderColor: c.border,
              padding: 20,
              paddingBottom: Math.max(20, insets.bottom + 12),
              backgroundColor: c.background,
            }}
          >
            {footer}
          </View>
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
  icon,
}: {
  label: string;
  onPress: () => void;
  busy?: boolean;
  secondary?: boolean;
  disabled?: boolean;
  danger?: boolean;
  icon?: ReactNode;
}) {
  const { colors: c } = useTheme();
  const ink = danger ? c.danger : secondary ? c.text : c.onPrimary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || busy, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: secondary ? 'transparent' : c.primary,
        borderColor: c.border,
        borderWidth: secondary ? 1 : 0,
        opacity: disabled || busy ? 0.5 : pressed ? 0.7 : 1,
      })}
    >
      {busy ? (
        <ActivityIndicator color={ink} />
      ) : (
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}
        >
          {icon}
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: ink,
              textAlign: 'center',
              flexShrink: 1,
            }}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
export function IconButton({
  label,
  icon,
  onPress,
  disabled = false,
}: {
  label: string;
  icon: ReactNode;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors: c } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        minWidth: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: pressed ? c.elevated : 'transparent',
        opacity: disabled ? 0.4 : 1,
      })}
    >
      {icon}
    </Pressable>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const { colors: c } = useTheme();
  const s = useUIStyles();
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
          s.input,
          props.multiline && { minHeight: 130, textAlignVertical: 'top' },
          props.style,
        ]}
      />
    </View>
  );
}
export function Notice({
  error,
  retry,
  title,
  description,
}: {
  error?: unknown;
  retry?: () => void;
  title?: string;
  description?: string;
}) {
  const { colors: c } = useTheme();
  return (
    <View
      accessibilityLiveRegion="polite"
      style={{
        paddingHorizontal: 24,
        paddingVertical: 40,
        gap: 14,
        alignItems: 'flex-start',
        maxWidth: 520,
        width: '100%',
        alignSelf: 'center',
      }}
    >
      {error ? (
        <IconAlertCircle color={c.muted} size={32} />
      ) : (
        <IconMessageCircle color={c.muted} size={32} />
      )}
      <Heading>
        {title ?? (error ? 'Não foi possível carregar' : 'A conversa começa com você')}
      </Heading>
      <Label muted>
        {description ??
          (error
            ? errorMessage(error)
            : 'Quando houver conteúdo, ele aparecerá aqui. Explore a comunidade e encontre novos assuntos.')}
      </Label>
      {retry && <Button label="Tentar novamente" secondary onPress={retry} />}
    </View>
  );
}
export function Skeleton({
  width = '100%',
  height = 16,
  circle = false,
}: {
  width?: number | `${number}%`;
  height?: number;
  circle?: boolean;
}) {
  const { colors: c } = useTheme();
  return (
    <View
      style={{ width, height, borderRadius: circle ? height / 2 : 4, backgroundColor: c.elevated }}
    />
  );
}
export function Loading() {
  const [opacity] = useState(() => new Animated.Value(1));
  useEffect(() => {
    let active = true;
    let animation: Animated.CompositeAnimation | undefined;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((reduce) => {
        if (!active || reduce) return;
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.45,
              duration: 700,
              useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 700,
              useNativeDriver: Platform.OS !== 'web',
            }),
          ])
        );
        animation.start();
      })
      .catch(() => undefined);
    return () => {
      active = false;
      animation?.stop();
    };
  }, [opacity]);
  return (
    <Animated.View
      accessibilityLabel="Carregando conteúdo"
      accessibilityRole="progressbar"
      style={{ padding: 20, gap: 24, opacity }}
    >
      {[0, 1, 2].map((key) => (
        <View key={key} style={{ flexDirection: 'row', gap: 12 }}>
          <Skeleton width={44} height={44} circle />
          <View style={{ flex: 1, gap: 10 }}>
            <Skeleton width="55%" />
            <Skeleton />
            <Skeleton width="80%" />
            <Skeleton width="65%" />
          </View>
        </View>
      ))}
    </Animated.View>
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
      {query.error && <Notice error={query.error} retry={() => query.refetch()} />}
      {children}
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
  const { colors: c } = useTheme();
  const s = useUIStyles();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        s.row,
        s.separator,
        { minHeight: 72, backgroundColor: pressed ? c.surface : 'transparent' },
      ]}
    >
      {leading}
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={[s.text, { fontWeight: '600' }]}>{title}</Text>
        {subtitle && <Label muted>{subtitle}</Label>}
      </View>
      <IconChevronRight color={c.muted} size={20} />
    </Pressable>
  );
}
export function Avatar({
  uri,
  name,
  size = 44,
  frameId,
  frameColor,
  frameDecoration,
  profileStyle,
}: {
  uri?: string | null;
  name: string;
  size?: number;
  frameId?: string | null;
  frameColor?: string;
  frameDecoration?: string;
  profileStyle?: import('../lib/types').ProfileIdentityStyle;
}) {
  const { colors: c } = useTheme();
  const [failedUri, setFailedUri] = useState<string | null>(null);
  frameId = frameId ?? profileStyle?.frame?.id;
  frameColor = frameColor ?? profileStyle?.frame?.color;
  const innerSize =
    frameId && frameId !== 'none'
      ? size - Math.max(3, size * 0.04) * 2 - Math.max(1, size * 0.025) * 2
      : size;
  const content =
    uri && uri !== failedUri ? (
      <Image
        accessibilityLabel={'Avatar de ' + name}
        source={{ uri: uri.startsWith('/') ? config.apiUrl + uri : uri }}
        onError={() => setFailedUri(uri)}
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
          backgroundColor: c.surface,
        }}
      />
    ) : (
      <View
        accessibilityLabel={'Avatar de ' + name}
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
          backgroundColor: c.elevated,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: c.text, fontSize: size / 2.3, fontWeight: '700' }}>
          {name[0]?.toUpperCase() ?? 'S'}
        </Text>
      </View>
    );
  return (
    <AvatarFrame
      frameId={frameId}
      color={frameColor}
      decoration={frameDecoration ?? profileStyle?.frame?.decoration}
      size={size}
    >
      {content}
    </AvatarFrame>
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
  const { colors: c } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0 }}
      contentContainerStyle={{ gap: 8 }}
    >
      {options.map((o) => (
        <Pressable
          key={o.value}
          accessibilityRole="tab"
          accessibilityState={{ selected: value === o.value }}
          onPress={() => onChange(o.value)}
          style={({ pressed }) => ({
            minHeight: 48,
            paddingHorizontal: 16,
            justifyContent: 'center',
            borderBottomWidth: 3,
            borderBottomColor: value === o.value ? c.primary : 'transparent',
            backgroundColor: pressed ? c.surface : 'transparent',
          })}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: value === o.value ? '700' : '500',
              color: value === o.value ? c.text : c.muted,
            }}
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
