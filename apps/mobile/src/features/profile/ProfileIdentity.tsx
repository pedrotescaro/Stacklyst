import { useState } from 'react';
import { Image, Linking, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SvgUri } from 'react-native-svg';
import { WebView } from 'react-native-webview';
import { IconTrophy, IconSchool, IconMusic } from '../../components/icons';
import { Button } from '../../components/ui';
import { config } from '../../lib/config';
import { useTheme } from '../../theme';
import {
  colorInk,
  countryName,
  type PublicProfileAchievement,
  type ProfilePreferences,
} from '../../lib/profile-customization';

export function ProfileFlag({ code, size = 26 }: { code: string; size?: number }) {
  const [failedCode, setFailedCode] = useState<string | null>(null);
  const { colors: c } = useTheme();
  if (failedCode === code)
    return (
      <Text
        accessibilityLabel={countryName(code)}
        style={{ color: c.text, fontSize: 12, fontWeight: '700' }}
      >
        {code.toUpperCase()}
      </Text>
    );
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={countryName(code)}
      style={{ width: size * 1.4, height: size }}
    >
      <SvgUri
        width="100%"
        height="100%"
        uri={`${config.apiUrl}/flags/profile/${code.toLowerCase()}.svg`}
        onError={() => setFailedCode(code)}
      />
    </View>
  );
}
export function ProfileTitle({
  achievement,
}: {
  achievement: Pick<PublicProfileAchievement, 'name' | 'color'>;
}) {
  return (
    <View
      accessibilityLabel={'Título: ' + achievement.name}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: achievement.color,
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 8,
        maxWidth: '100%',
      }}
    >
      <IconTrophy size={14} color={colorInk(achievement.color)} />
      <Text
        style={{
          flexShrink: 1,
          color: colorInk(achievement.color),
          fontSize: 12,
          fontWeight: '700',
        }}
      >
        {achievement.name}
      </Text>
    </View>
  );
}
export function ProfileExtras({
  preferences,
  achievements = [],
}: {
  preferences?: ProfilePreferences | null;
  achievements?: PublicProfileAchievement[];
}) {
  const { colors: c } = useTheme();
  const [musicOpen, setMusicOpen] = useState(false);
  const [notice, setNotice] = useState('');
  if (!preferences) return null;
  const music = preferences.music;
  const musicUrl =
    music && /^[a-zA-Z0-9]{22}$/.test(music.trackId)
      ? `https://open.spotify.com/track/${music.trackId}`
      : null;
  const featured = achievements.filter((item) =>
    preferences.featuredAchievementIds.includes(item.id)
  );
  return (
    <View style={{ gap: 20 }}>
      {!!preferences.tags.length && (
        <View
          accessibilityLabel="Interesses"
          style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}
        >
          {preferences.tags.map((tag) => (
            <Pressable
              key={tag}
              accessibilityRole="button"
              accessibilityLabel={'Explorar #' + tag}
              onPress={() => router.push(('/explore?tag=' + encodeURIComponent(tag)) as never)}
              style={{
                minHeight: 48,
                justifyContent: 'center',
                paddingHorizontal: 12,
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: 24,
              }}
            >
              <Text style={{ color: c.text, fontSize: 14 }}>#{tag}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {!!preferences.studies.length && (
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <IconSchool size={18} color={c.text} />
            <Text style={{ color: c.text, fontWeight: '700', fontSize: 15 }}>
              Estudando atualmente
            </Text>
          </View>
          <Text style={{ color: c.text, fontSize: 14, lineHeight: 22 }}>
            {preferences.studies.join(' · ')}
          </Text>
        </View>
      )}
      {music && musicUrl && (
        <View
          style={{
            gap: 12,
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 12,
            padding: 14,
            backgroundColor: c.surface,
          }}
        >
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <IconMusic size={18} color={c.text} />
            <Text style={{ color: c.text, fontSize: 15, fontWeight: '700' }}>Música do perfil</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            {music.artworkUrl && (
              <Image
                accessibilityLabel="Capa da música"
                source={{ uri: music.artworkUrl }}
                style={{ width: 56, height: 56, borderRadius: 6 }}
              />
            )}
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ color: c.text, fontWeight: '700' }}>
                {music.title || 'Faixa do Spotify'}
              </Text>
              {music.artist && <Text style={{ color: c.muted }}>{music.artist}</Text>}
            </View>
          </View>
          <Button
            secondary
            label={musicOpen ? 'Ocultar player' : 'Abrir player do Spotify'}
            onPress={() => setMusicOpen(!musicOpen)}
          />
          {musicOpen && (
            <WebView
              source={{
                uri: `https://open.spotify.com/embed/track/${music.trackId}?utm_source=generator`,
              }}
              style={{ height: 152, backgroundColor: 'transparent' }}
              mediaPlaybackRequiresUserAction
              allowsInlineMediaPlayback
              javaScriptEnabled
              onError={() =>
                setNotice('Player indisponível. Você ainda pode abrir a faixa no Spotify.')
              }
              onShouldStartLoadWithRequest={(request) =>
                request.url.startsWith('https://open.spotify.com/embed/') ||
                request.url === 'about:blank'
              }
            />
          )}
          <Button
            secondary
            label="Ouvir no Spotify"
            onPress={() =>
              void Linking.openURL(musicUrl).catch(() =>
                setNotice('Não foi possível abrir o Spotify. Tente novamente.')
              )
            }
          />
          {!!notice && (
            <Text accessibilityLiveRegion="polite" style={{ color: c.muted }}>
              {notice}
            </Text>
          )}
        </View>
      )}
      {!!featured.length && (
        <View style={{ gap: 10 }}>
          <Text style={{ color: c.text, fontSize: 15, fontWeight: '700' }}>
            Conquistas em destaque
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {featured.map((item) => (
              <ProfileTitle key={item.id} achievement={item} />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
