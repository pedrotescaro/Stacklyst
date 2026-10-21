import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconDots } from './icons';
import { useTheme } from '../theme';

export interface MenuAction {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

/** A measured, dismissible menu shared by post and message overflow actions. */
export function ActionMenu({
  label,
  items,
  disabled = false,
  open,
  onOpenChange,
  icon,
}: {
  label: string;
  items: MenuAction[];
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  icon?: ReactNode;
}) {
  const { colors: c } = useTheme();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const anchor = useRef<View>(null);
  const [localOpen, setLocalOpen] = useState(false);
  const [position, setPosition] = useState({ x: 16, y: 80 });
  const visible = open ?? localOpen;
  const menuWidth = Math.min(280, width - 32);
  const menuHeight = Math.min(items.length * 52 + 8, height * 0.6);
  const change = (next: boolean) => {
    setLocalOpen(next);
    onOpenChange?.(next);
  };
  useEffect(() => {
    if (visible)
      anchor.current?.measureInWindow((x, y, w, h) => {
        setPosition({
          x: Math.max(16, Math.min(x + w - menuWidth, width - menuWidth - 16)),
          y:
            y + h + menuHeight < height - insets.bottom
              ? y + h
              : Math.max(insets.top + 8, y - menuHeight),
        });
      });
  }, [visible, width, height, menuWidth, menuHeight, insets.top, insets.bottom]);
  return (
    <>
      <Pressable
        ref={anchor}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded: visible, disabled }}
        disabled={disabled}
        onPress={() => change(!visible)}
        style={({ pressed }) => ({
          width: 48,
          height: 48,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 24,
          backgroundColor: pressed ? c.elevated : 'transparent',
          opacity: disabled ? 0.5 : 1,
        })}
      >
        {icon ?? <IconDots size={21} color={c.muted} strokeWidth={1.8} />}
      </Pressable>
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={() => change(false)}
      >
        <View style={{ flex: 1 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar menu"
            onPress={() => change(false)}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <View
            accessibilityViewIsModal
            accessibilityRole="menu"
            onAccessibilityEscape={() => change(false)}
            style={{
              position: 'absolute',
              top: position.y,
              left: position.x,
              width: menuWidth,
              maxHeight: menuHeight,
              paddingVertical: 4,
              backgroundColor: c.elevated,
              borderWidth: 1,
              borderColor: c.socialBorder,
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            <ScrollView keyboardShouldPersistTaps="handled">
              {items.map((item) => (
                <Pressable
                  key={item.label}
                  accessibilityRole="menuitem"
                  accessibilityLabel={item.label}
                  accessibilityState={{ disabled: !!item.disabled }}
                  disabled={item.disabled}
                  onPress={() => {
                    change(false);
                    item.onPress();
                  }}
                  style={({ pressed }) => ({
                    minHeight: 52,
                    justifyContent: 'center',
                    paddingHorizontal: 18,
                    paddingVertical: 12,
                    backgroundColor: pressed ? c.composer : 'transparent',
                    opacity: item.disabled ? 0.5 : 1,
                  })}
                >
                  <Text style={{ color: item.destructive ? c.danger : c.text, fontSize: 16 }}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
