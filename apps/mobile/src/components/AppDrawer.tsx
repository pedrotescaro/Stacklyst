import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  IconUser,
  IconBookmark,
  IconTrophy,
  IconSwords,
  IconCode,
  IconCalendar,
  IconBriefcase,
  IconSettings,
  IconX,
  IconLogout,
  IconShieldCheck,
  IconBuilding,
} from '~/components/icons';
import { useTheme } from '../theme';
import { useMe, useSession } from '../lib/session';
import { DrawerContext } from '../lib/navigation';
import { disablePreview } from '../lib/preview';
import { queryClient } from '../lib/query';
import { useReducedMotion } from '../lib/motion';
import { Avatar, IconButton } from './ui';

export function AppDrawer({ children }: { children: ReactNode }) {
  const { colors: c } = useTheme();
  const { isPreview } = useSession();
  const me = useMe();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(width - 40, 360);
  const [visible, setVisible] = useState(false);
  const [progress] = useState(() => new Animated.Value(0));
  const closeDrawer = useCallback(() => {
    Animated.timing(progress, {
      toValue: 0,
      duration: reduced ? 0 : 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setVisible(false);
    });
  }, [progress, reduced]);
  const openDrawer = useCallback(() => setVisible(true), []);
  useEffect(() => {
    if (visible)
      Animated.timing(progress, {
        toValue: 1,
        duration: reduced ? 0 : 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
  }, [visible, progress, reduced]);
  const context = useMemo(() => ({ openDrawer, closeDrawer }), [openDrawer, closeDrawer]);
  const open = (path: string) => {
    closeDrawer();
    router.push(path as never);
  };
  const entries = [
    { title: 'Perfil', path: '/profile', Icon: IconUser },
    { title: 'Itens salvos', path: '/bookmarks', Icon: IconBookmark },
    { title: 'Ranking', path: '/ranking', Icon: IconTrophy },
    { title: 'Duelos', path: '/duels', Icon: IconSwords },
    { title: 'Praticar código', path: '/practice', Icon: IconCode },
    { title: 'Eventos', path: '/events', Icon: IconCalendar },
    { title: 'Vagas', path: '/jobs', Icon: IconBriefcase },
    { title: 'Configurações', path: '/settings', Icon: IconSettings },
  ];
  if (['EVALUATOR', 'ADMIN'].includes(me.data?.role ?? ''))
    entries.push({ title: 'Avaliações', path: '/evaluator', Icon: IconShieldCheck });
  if (['RECRUITER', 'ADMIN'].includes(me.data?.role ?? ''))
    entries.push({ title: 'Recrutamento', path: '/recruiter', Icon: IconBuilding });
  if (me.data?.role === 'ADMIN')
    entries.push({ title: 'Administração', path: '/admin', Icon: IconShieldCheck });
  return (
    <DrawerContext.Provider value={context}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={closeDrawer}
        statusBarTranslucent
      >
        <View style={{ flex: 1 }}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: '#000000',
                opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] }),
              },
            ]}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar menu"
            onPress={closeDrawer}
            style={StyleSheet.absoluteFill}
          />
          <Animated.View
            accessibilityViewIsModal
            onAccessibilityEscape={closeDrawer}
            style={{
              width: drawerWidth,
              flex: 1,
              backgroundColor: c.background,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
              transform: [
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-drawerWidth, 0],
                  }),
                },
              ],
            }}
          >
            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 12,
                }}
              >
                <Avatar
                  size={52}
                  name={me.data?.username ?? 'S'}
                  uri={me.data?.avatar_url}
                  profileStyle={me.data?.avatar_config?.profileStyle}
                />
                <IconButton
                  label="Fechar menu da conta"
                  onPress={closeDrawer}
                  icon={<IconX color={c.text} size={24} />}
                />
              </View>
              <Text style={{ color: c.text, fontSize: 22, fontWeight: '800' }}>
                {me.data?.avatar_config?.displayName || me.data?.username || 'Sua conta'}
              </Text>
              <Text style={{ color: c.muted, fontSize: 15, marginTop: 4 }}>
                @{me.data?.username ?? 'stacklyst'}
              </Text>
              {me.data && (
                <Text style={{ color: c.muted, fontSize: 14, marginTop: 16, marginBottom: 20 }}>
                  <Text style={{ fontWeight: '700', color: c.text }}>{me.data.total_xp ?? 0}</Text>{' '}
                  XP ·{' '}
                  <Text style={{ fontWeight: '700', color: c.text }}>
                    {me.data.streak_days ?? 0}
                  </Text>{' '}
                  dias de ofensiva
                </Text>
              )}
              <View
                style={{
                  borderTopColor: c.border,
                  borderTopWidth: StyleSheet.hairlineWidth,
                  paddingTop: 12,
                }}
              >
                {entries.map(({ title, path, Icon }) => (
                  <Pressable
                    key={path}
                    accessibilityRole="button"
                    onPress={() => open(path)}
                    style={({ pressed }) => ({
                      minHeight: 54,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 20,
                      backgroundColor: pressed ? c.surface : 'transparent',
                    })}
                  >
                    <Icon color={c.text} size={24} strokeWidth={1.8} />
                    <Text style={{ color: c.text, fontWeight: '600', fontSize: 19 }}>{title}</Text>
                  </Pressable>
                ))}
              </View>
              {isPreview && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderColor: c.border,
                    marginTop: 16,
                    paddingTop: 12,
                  }}
                >
                  {isPreview && (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        closeDrawer();
                        disablePreview();
                        queryClient.clear();
                        router.replace('/auth');
                      }}
                      style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                    >
                      <IconLogout color={c.primary} size={20} />
                      <Text style={{ color: c.primary, fontWeight: '700' }}>Entrar na conta</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </DrawerContext.Provider>
  );
}
