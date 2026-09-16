import { Tabs } from 'expo-router';
import IconHome from '@tabler/icons-react-native/IconHome';
import IconRoute from '@tabler/icons-react-native/IconRoute';
import IconCode from '@tabler/icons-react-native/IconCode';
import IconSwords from '@tabler/icons-react-native/IconSwords';
import IconUser from '@tabler/icons-react-native/IconUser';
import { colors } from '../../../src/theme';
const screens = [
  ['index', 'Feed', IconHome],
  ['learn', 'Aprender', IconRoute],
  ['practice', 'Praticar', IconCode],
  ['duels', 'Duelos', IconSwords],
  ['profile', 'Perfil', IconUser],
] as const;
export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
        tabBarItemStyle: { minHeight: 48 },
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      {screens.map(([name, title, Icon]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{ title, tabBarIcon: ({ color, size }) => <Icon color={color} size={size} /> }}
        />
      ))}
    </Tabs>
  );
}
