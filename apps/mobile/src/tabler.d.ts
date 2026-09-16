// Tabler 3.46 subpath runtime exports omit declaration exports.
// Use its existing component type while importing only the used icon.
declare module '@tabler/icons-react-native/*' {
  import type { IconHome } from '@tabler/icons-react-native';
  const component: typeof IconHome;
  export default component;
}
