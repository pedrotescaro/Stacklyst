import { useEffect, useState } from 'react';
import { AppState, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconTrophy, IconX } from '../../components/icons';
import { api } from '../../lib/api';
import { useSession } from '../../lib/session';
import { useTheme } from '../../theme';
import type { ProfileCustomizationData } from '../../lib/profile-customization';

/** The server atomically claims unannounced grants; no local counters can grant a title. */
export function AchievementNotice() {
  const { session, isPreview } = useSession();
  const userId = session?.user.id;
  const { colors: c } = useTheme();
  const insets = useSafeAreaInsets();
  const [notice, setNotice] = useState<{ userId: string; title: string } | null>(null);
  useEffect(() => {
    if (!userId || isPreview) return;
    let active = true;
    let inFlight = false;
    const controller = new AbortController();
    const check = async () => {
      if (!active || inFlight || AppState.currentState !== 'active') return;
      inFlight = true;
      try {
        const state = await api<ProfileCustomizationData>('/api/profile/achievements?notify=1', {
          signal: controller.signal,
        });
        if (!active || !state.newUnlocks.length) return;
        const names = state.achievements
          .filter((item) => state.newUnlocks.includes(item.id))
          .map((item) => item.name);
        setNotice({ userId, title: names.join(', ') || 'Uma nova conquista está disponível' });
      } catch {
        // Grants remain in the notification center; a background check never interrupts a task.
      } finally {
        inFlight = false;
      }
    };
    void check();
    const interval = setInterval(() => void check(), 60000);
    const appState = AppState.addEventListener('change', (next) => {
      if (next === 'active') void check();
    });
    return () => {
      active = false;
      controller.abort();
      clearInterval(interval);
      appState.remove();
    };
  }, [userId, isPreview]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 8000);
    return () => clearTimeout(timer);
  }, [notice]);
  if (!notice || notice.userId !== session?.user.id || isPreview) return null;
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        top: insets.top + 8,
        alignItems: 'center',
      }}
    >
      <View
        accessibilityLiveRegion="polite"
        style={{
          width: '100%',
          maxWidth: 620,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: c.surface,
          borderWidth: 1,
          borderColor: c.border,
          borderRadius: 12,
          padding: 8,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={'Nova conquista: ' + notice.title + '. Ver minhas conquistas.'}
          onPress={() => {
            setNotice(null);
            router.push('/achievements');
          }}
          style={{
            flex: 1,
            minHeight: 52,
            padding: 8,
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <IconTrophy size={24} color={c.warning} />
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={{ color: c.text, fontWeight: '700' }}>Nova conquista</Text>
            <Text numberOfLines={2} style={{ color: c.muted }}>
              {notice.title}
            </Text>
          </View>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dispensar aviso de conquista"
          onPress={() => setNotice(null)}
          style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}
        >
          <IconX size={20} color={c.muted} />
        </Pressable>
      </View>
    </View>
  );
}
