// Tabler 3.46 ships individual runtime exports but omits their declaration files.
// Reuse the upstream component type without importing its runtime barrel.
declare module '@tabler/icons-react-native/*' {
  import type { IconHome } from '@tabler/icons-react-native';
  const component: typeof IconHome;
  export default component;
}
