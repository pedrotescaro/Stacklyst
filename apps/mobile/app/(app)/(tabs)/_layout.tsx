import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { IconHome, IconSearch, IconRoute, IconBell, IconMail } from '~/components/icons';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../src/theme';
import { api } from '../../../src/lib/api';
const screens = [
  ['index', 'Início', IconHome],
  ['search', 'Explorar', IconSearch],
  ['learn', 'Aprender', IconRoute],
  ['activity', 'Notificações', IconBell],
  ['inbox', 'Mensagens', IconMail],
] as const;
export default function Layout() {
  const { colors: c } = useTheme();
  const insets = useSafeAreaInsets();
  const unread = useQuery({
    queryKey: ['unread'],
    queryFn: () => api<{ count: number }>('/api/notifications/unread-count'),
    refetchInterval: 30000,
  });
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.text,
        tabBarInactiveTintColor: c.muted,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: c.background,
          borderTopColor: c.border,
          height: 58 + Math.max(insets.bottom, 8),
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        tabBarItemStyle: { minHeight: 48 },
      }}
    >
      {screens.map(([name, title, Icon]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarAccessibilityLabel: title,
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  minWidth: 48,
                  minHeight: 48,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Icon color={color} size={26} strokeWidth={focused ? 2.5 : 1.7} />
                {name === 'activity' && !!unread.data?.count && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      minWidth: 17,
                      paddingHorizontal: 4,
                      height: 17,
                      backgroundColor: c.primary,
                      borderRadius: 9,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: c.onPrimary, fontSize: 10, fontWeight: '700' }}>
                      {unread.data.count > 99 ? '99+' : unread.data.count}
                    </Text>
                  </View>
                )}
                {focused && (
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 1,
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: c.primary,
                    }}
                  />
                )}
              </View>
            ),
          }}
        />
      ))}
      {['practice', 'duels', 'profile'].map((name) => (
        <Tabs.Screen key={name} name={name} options={{ href: null }} />
      ))}
    </Tabs>
  );
}
