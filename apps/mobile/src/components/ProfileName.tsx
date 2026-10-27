import { Text, type TextProps } from 'react-native';
import type { Person } from '../lib/types';
import { readableColor } from '../lib/profile-customization';
import { useTheme } from '../theme';

/** Uses only the server-validated public identity snapshot from normal author projections. */
export function ProfileName({ user, style, ...props }: TextProps & { user: Person }) {
  const { colors: c } = useTheme();
  const identity =
    user.customization?.preferences.nameStyle || user.avatar_config?.profileStyle?.nameStyle;
  return (
    <Text
      {...props}
      style={[
        { color: c.text },
        style,
        identity && {
          color: readableColor(identity.color, c.background, c.text),
          fontWeight: identity.bold ? '800' : '500',
          fontStyle: identity.italic ? 'italic' : 'normal',
          textDecorationLine: identity.underline ? 'underline' : 'none',
        },
      ]}
    >
      {user.name || user.avatar_config?.name || user.avatar_config?.displayName || user.username}
    </Text>
  );
}
