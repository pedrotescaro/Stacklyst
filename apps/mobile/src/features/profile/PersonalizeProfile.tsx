import { useEffect, useState } from 'react';
import { Alert, Keyboard, Pressable, Switch, Text, View } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  AsyncState,
  Avatar,
  Button,
  Choice,
  Field,
  Heading,
  Label,
  Screen,
} from '../../components/ui';
import { api, errorMessage, send } from '../../lib/api';
import { useMe, useSession } from '../../lib/session';
import { queryClient } from '../../lib/query';
import { ScopedTheme, useTheme } from '../../theme';
import {
  colorChoices,
  colorInk,
  contrast,
  countryCodes,
  countryName,
  defaultProfilePreferences,
  profilePalette,
  type ChatPreferences,
  type ProfileAchievement,
  type ProfileCustomizationData,
  type ProfilePreferences,
} from '../../lib/profile-customization';
import { useCustomization } from './useCustomization';
import { ProfileBanner } from './ProfileBanner';
import { ProfileExtras, ProfileFlag, ProfileTitle } from './ProfileIdentity';
import { profileName } from './profile-model';
import type { Person } from '../../lib/types';

const sections = [
  { value: 'appearance', label: 'Aparência' },
  { value: 'name', label: 'Nome e cores' },
  { value: 'identity', label: 'Bandeira e títulos' },
  { value: 'frames', label: 'Avatar e molduras' },
  { value: 'banner', label: 'Banner' },
  { value: 'tags', label: 'Tags e interesses' },
  { value: 'music', label: 'Música do perfil' },
  { value: 'studies', label: 'Estudando atualmente' },
  { value: 'chat', label: 'Cores do chat' },
];
const themes: {
  name: string;
  backgroundColor: string;
  cardColor: string;
  accentColor: string;
  borderColor: string;
}[] = [
  {
    name: 'Noturno',
    backgroundColor: '#08090B',
    cardColor: '#15181E',
    accentColor: '#5AB6FF',
    borderColor: '#353B45',
  },
  {
    name: 'Azul',
    backgroundColor: '#102A43',
    cardColor: '#173A57',
    accentColor: '#7CCBFF',
    borderColor: '#426B8A',
  },
  {
    name: 'Roxo',
    backgroundColor: '#261B3B',
    cardColor: '#36274E',
    accentColor: '#C6A3FF',
    borderColor: '#695183',
  },
  {
    name: 'Rosa',
    backgroundColor: '#3B1C32',
    cardColor: '#4B2B40',
    accentColor: '#FFA7D5',
    borderColor: '#80576F',
  },
  {
    name: 'Verde',
    backgroundColor: '#12352A',
    cardColor: '#1C4638',
    accentColor: '#85E4BC',
    borderColor: '#4F7C69',
  },
  {
    name: 'Claro',
    backgroundColor: '#F5F7FA',
    cardColor: '#FFFFFF',
    accentColor: '#0062A8',
    borderColor: '#B6C1CC',
  },
];
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
function ColorField({
  label,
  value,
  onChange,
  disabled = false,
  nullable = true,
}: {
  label: string;
  value: string | null;
  onChange: (color: string | null) => void;
  disabled?: boolean;
  nullable?: boolean;
}) {
  const { colors: c } = useTheme();
  return (
    <View style={{ gap: 10 }}>
      <Label>{label}</Label>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {colorChoices.map((color) => (
          <Pressable
            key={color}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={label + ': ' + color}
            accessibilityState={{
              selected: color.toLowerCase() === value?.toLowerCase(),
              disabled,
            }}
            onPress={() => onChange(color)}
            style={{
              width: 48,
              height: 48,
              padding: 5,
              borderRadius: 24,
              borderWidth: color.toLowerCase() === value?.toLowerCase() ? 3 : 1,
              borderColor: color.toLowerCase() === value?.toLowerCase() ? c.text : c.border,
            }}
          >
            <View style={{ flex: 1, borderRadius: 20, backgroundColor: color }} />
          </Pressable>
        ))}
      </View>
      <Field
        label={'Cor personalizada: ' + label.toLowerCase()}
        placeholder="#0083FE"
        value={value || ''}
        editable={!disabled}
        onChangeText={(text) => onChange(text ? text.toUpperCase() : null)}
        maxLength={7}
        autoCapitalize="characters"
      />
      {nullable && (
        <Button
          label="Usar cor padrão"
          secondary
          disabled={disabled}
          onPress={() => onChange(null)}
        />
      )}
    </View>
  );
}
function Toggle({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  const { colors: c } = useTheme();
  return (
    <View
      style={{
        minHeight: 52,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <Text style={{ color: c.text, fontSize: 15, flex: 1 }}>{label}</Text>
      <Switch
        accessibilityLabel={label}
        value={value}
        disabled={disabled}
        onValueChange={onChange}
        trackColor={{ false: c.border, true: c.primary }}
        thumbColor={c.onPrimary}
      />
    </View>
  );
}
function AchievementRow({
  item,
  equipped,
  featured,
  onEquip,
  onFeature,
  disabled,
}: {
  item: ProfileAchievement;
  equipped: boolean;
  featured: boolean;
  onEquip: () => void;
  onFeature: () => void;
  disabled: boolean;
}) {
  const { colors: c } = useTheme();
  const progress = Math.min(1, item.progress / item.requirement.target);
  return (
    <View style={{ borderBottomWidth: 1, borderColor: c.border, paddingVertical: 18, gap: 10 }}>
      <ProfileTitle achievement={item} />
      <Text style={{ color: c.text, fontSize: 14, lineHeight: 21 }}>{item.description}</Text>
      <Text style={{ color: c.muted, fontSize: 12 }}>
        {item.unlocked ? 'Conquistado' : `${item.progress} de ${item.requirement.target}`} ·{' '}
        {(
          {
            common: 'Comum',
            uncommon: 'Incomum',
            rare: 'Raro',
            epic: 'Épico',
            legendary: 'Lendário',
            seasonal: 'Sazonal',
          } as Record<string, string>
        )[item.rarity] || item.rarity}
      </Text>
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: item.requirement.target,
          now: Math.min(item.progress, item.requirement.target),
        }}
        style={{ height: 6, backgroundColor: c.border, borderRadius: 3, overflow: 'hidden' }}
      >
        <View
          style={{ height: '100%', width: `${progress * 100}%`, backgroundColor: item.color }}
        />
      </View>
      {item.unlocked && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Button
            label={equipped ? 'Remover título' : 'Equipar título'}
            secondary
            disabled={disabled}
            onPress={onEquip}
          />
          <Button
            label={featured ? 'Remover destaque' : 'Destacar conquista'}
            secondary
            disabled={disabled}
            onPress={onFeature}
          />
        </View>
      )}
    </View>
  );
}
export function PersonalizeProfile() {
  const params = useLocalSearchParams<{ section?: string }>();
  const q = useCustomization();
  const me = useMe();
  const { session, isPreview } = useSession();
  if (!session || isPreview)
    return (
      <Screen title="Personalizar perfil" back>
        <Heading>Um perfil com a sua identidade</Heading>
        <Label>Entre na sua conta para salvar bandeiras, cores, molduras e suas conquistas.</Label>
        <Button label="Entrar" onPress={() => router.push('/auth')} />
      </Screen>
    );
  if (q.data && me.data)
    return <PersonalizationForm initial={q.data} user={me.data} initialSection={params.section} />;
  return (
    <Screen title="Personalizar perfil" back>
      <AsyncState query={q}>
        <AsyncState query={me}>{null}</AsyncState>
      </AsyncState>
    </Screen>
  );
}
function PersonalizationForm({
  initial,
  user,
  initialSection,
}: {
  initial: ProfileCustomizationData;
  user: Person;
  initialSection?: string;
}) {
  const { colors: c } = useTheme();
  const [preferences, setPreferences] = useState(() => clone(initial.preferences));
  const [chat, setChat] = useState(() => clone(initial.chat));
  const [version, setVersion] = useState(initial.version);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [saved, setSaved] = useState(() => ({
    preferences: clone(initial.preferences),
    chat: clone(initial.chat),
    avatarUrl: initial.avatarUrl,
  }));
  const [section, setSection] = useState(
    sections.some((item) => item.value === initialSection) ? initialSection! : 'appearance'
  );
  const [flagSearch, setFlagSearch] = useState('');
  const [flagLimit, setFlagLimit] = useState(12);
  const [tag, setTag] = useState('');
  const [study, setStudy] = useState('');
  const [musicUrl, setMusicUrl] = useState('');
  const [notice, setNotice] = useState('');
  const [uploading, setUploading] = useState(false);
  const [tagQuery, setTagQuery] = useState('');
  const [musicQuery, setMusicQuery] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setTagQuery(tag.trim().replace(/^#/, '').toLowerCase()), 250);
    return () => clearTimeout(timer);
  }, [tag]);
  const tagSuggestions = useQuery({
    queryKey: ['profile-tags', tagQuery],
    queryFn: ({ signal }) =>
      api<{ tags: string[] }>('/api/profile/tags?q=' + encodeURIComponent(tagQuery), { signal }),
    enabled: tagQuery.length > 0 && tagQuery.length <= 24,
    staleTime: 30000,
  });
  const searchMusic = useMutation({
    mutationFn: () =>
      api<{ configured: boolean; tracks: NonNullable<ProfilePreferences['music']>[] }>(
        '/api/profile/music/search?q=' + encodeURIComponent(musicQuery.trim())
      ),
  });
  const update = <K extends keyof ProfilePreferences>(key: K, value: ProfilePreferences[K]) => {
    setPreferences((current) => ({ ...current, [key]: value }));
    setNotice('');
  };
  const save = useMutation({
    mutationFn: (body: {
      preferences: ProfilePreferences;
      chat: ChatPreferences;
      version: number;
      avatarUrl?: string | null;
    }) => send<ProfileCustomizationData>('/api/profile/customization', body, 'PUT'),
    onSuccess: (result) => {
      setPreferences(result.preferences);
      setChat(result.chat);
      setVersion(result.version);
      setAvatarUrl(result.avatarUrl);
      setSaved({
        preferences: clone(result.preferences),
        chat: clone(result.chat),
        avatarUrl: result.avatarUrl,
      });
      setNotice('Seu perfil foi personalizado. As alterações já estão salvas.');
      queryClient.setQueryData(['profile-customization', user.id], result);
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      void queryClient.invalidateQueries({ queryKey: ['profile-customization-public'] });
      void queryClient.invalidateQueries({ queryKey: ['me'] });
      void queryClient.invalidateQueries({ queryKey: ['list'] });
    },
  });
  const resolveMusic = useMutation({
    mutationFn: () =>
      send<{
        trackId: string;
        title?: string | null;
        artist?: string | null;
        imageUrl?: string | null;
        artworkUrl?: string | null;
      }>('/api/profile/music/resolve', { url: musicUrl }),
    onSuccess: (track) => {
      update('music', {
        trackId: track.trackId,
        title: track.title || null,
        artist: track.artist || null,
        artworkUrl: track.artworkUrl || track.imageUrl || null,
      });
      setMusicUrl('');
    },
  });
  const pickImage = async (kind: 'avatar' | 'banner', source: 'library' | 'camera' = 'library') => {
    setNotice('');
    try {
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted)
          throw new Error(
            'Permita o acesso à câmera nas configurações do aparelho ou escolha uma foto da galeria.'
          );
      }
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        quality: 0.85,
        allowsEditing: true,
        aspect: kind === 'avatar' ? [1, 1] : [3, 1],
      };
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);
      if (result.canceled) return;
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024)
        throw new Error('A imagem deve ter até 5 MB.');
      if (!asset.width || !asset.height || asset.width < 64 || asset.height < 64)
        throw new Error('Escolha uma imagem com pelo menos 64 × 64 pixels.');
      setUploading(true);
      const data = new FormData();
      data.append('file', {
        uri: asset.uri,
        name: asset.fileName || 'profile.jpg',
        type: asset.mimeType || 'image/jpeg',
      } as unknown as Blob);
      const image = await api<{ url: string }>('/api/upload', { method: 'POST', body: data });
      if (kind === 'banner')
        update('banner', { ...preferences.banner, mode: 'image', imageUrl: image.url });
      else setAvatarUrl(image.url);
      setNotice('Imagem pronta na prévia. Toque em Salvar personalização para confirmar.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Não foi possível enviar a imagem.');
    } finally {
      setUploading(false);
    }
  };
  const busy = save.isPending || uploading || resolveMusic.isPending || searchMusic.isPending;
  const dirty =
    avatarUrl !== saved.avatarUrl ||
    JSON.stringify(preferences) !== JSON.stringify(saved.preferences) ||
    JSON.stringify(chat) !== JSON.stringify(saved.chat);
  const previewColors = profilePalette(c, preferences.appearance);
  const equippedTitle = initial.achievements.find(
    (item) => item.id === preferences.equippedTitleId
  );
  const flags = [
    ...countryCodes.map((id) => ({ id, label: countryName(id) })),
    { id: 'dev', label: 'Desenvolvimento' },
    { id: 'rainbow', label: 'Diversidade' },
  ].filter(
    (item) =>
      !flagSearch ||
      `${item.id} ${item.label}`
        .toLocaleLowerCase('pt-BR')
        .includes(flagSearch.toLocaleLowerCase('pt-BR'))
  );
  const colorValid = (color: string | null) => color === null || /^#[\da-f]{6}$/i.test(color);
  const valid = [
    ...Object.values(preferences.appearance),
    preferences.nameStyle.color,
    preferences.banner.color,
    preferences.banner.secondaryColor,
    chat.bubbleColor,
    chat.accentColor,
    chat.backgroundColor,
  ].every(colorValid);
  const nameContrast =
    !preferences.nameStyle.color ||
    !/^#[\da-f]{6}$/i.test(preferences.nameStyle.color) ||
    contrast(preferences.nameStyle.color, previewColors.background) >= 4.5;
  const addTag = (value = tag) => {
    const normalized = value.trim().replace(/^#/, '').toLowerCase();
    if (!/^[\p{L}\p{N}_+-]{2,24}$/u.test(normalized)) {
      setNotice('Use de 2 a 24 letras, números, +, - ou _ na tag.');
      return;
    }
    if (preferences.tags.includes(normalized)) {
      setTag('');
      return;
    }
    if (preferences.tags.length >= 10) {
      setNotice('Você pode escolher até dez tags.');
      return;
    }
    update('tags', [...preferences.tags, normalized]);
    setTag('');
  };
  const addStudy = (value = study) => {
    const normalized = value.trim();
    if (normalized.length < 2 || normalized.length > 60) {
      setNotice('Informe um assunto com 2 a 60 caracteres.');
      return;
    }
    if (preferences.studies.includes(normalized)) {
      setStudy('');
      return;
    }
    if (preferences.studies.length >= 3) {
      setNotice('Você pode informar até três assuntos.');
      return;
    }
    update('studies', [...preferences.studies, normalized]);
    setStudy('');
  };
  return (
    <View style={{ flex: 1 }}>
      <Screen
        title="Personalizar perfil"
        scroll
        back
        footer={
          <View style={{ gap: 10 }}>
            {(notice || save.error) && (
              <Text
                accessibilityLiveRegion="polite"
                style={{ color: save.error ? c.danger : c.text, fontSize: 14, lineHeight: 21 }}
              >
                {save.error ? errorMessage(save.error) + ' Suas escolhas continuam aqui.' : notice}
              </Text>
            )}
            <Button
              label="Salvar personalização"
              busy={save.isPending}
              disabled={busy || !valid || !nameContrast || !dirty}
              onPress={() => {
                Keyboard.dismiss();
                save.mutate({
                  preferences,
                  chat,
                  version,
                  ...(avatarUrl !== saved.avatarUrl ? { avatarUrl } : {}),
                });
              }}
            />
            {dirty && (
              <Button
                label="Descartar alterações"
                secondary
                disabled={busy}
                onPress={() =>
                  Alert.alert(
                    'Descartar alterações?',
                    'As escolhas ainda não salvas serão removidas da prévia.',
                    [
                      { text: 'Continuar editando', style: 'cancel' },
                      {
                        text: 'Descartar',
                        style: 'destructive',
                        onPress: () => {
                          setPreferences(clone(saved.preferences));
                          setChat(clone(saved.chat));
                          setAvatarUrl(saved.avatarUrl);
                          setNotice('Alterações descartadas.');
                          save.reset();
                        },
                      },
                    ]
                  )
                }
              />
            )}
            {save.error && (
              <Button
                secondary
                label="Recarregar versão salva"
                disabled={busy}
                onPress={() => {
                  const cached = queryClient.getQueryData<ProfileCustomizationData>([
                    'profile-customization',
                    user.id,
                  ]);
                  void api<ProfileCustomizationData>('/api/profile/customization')
                    .then((result) => {
                      setPreferences(result.preferences);
                      setChat(result.chat);
                      setVersion(result.version);
                      setAvatarUrl(result.avatarUrl);
                      setSaved({
                        preferences: clone(result.preferences),
                        chat: clone(result.chat),
                        avatarUrl: result.avatarUrl,
                      });
                      save.reset();
                      setNotice('Versão salva carregada.');
                      queryClient.setQueryData(['profile-customization', user.id], result);
                    })
                    .catch(() =>
                      setNotice(
                        cached
                          ? 'Não foi possível atualizar. Tente novamente.'
                          : 'Conexão indisponível.'
                      )
                    );
                }}
              />
            )}
          </View>
        }
      >
        <ScopedTheme colors={previewColors}>
          <View
            accessibilityLabel="Pré-visualização do perfil"
            style={{
              backgroundColor: previewColors.background,
              borderColor: previewColors.border,
              borderWidth: 1,
              borderRadius: 16,
              padding: 14,
              gap: 12,
            }}
          >
            <ProfileBanner
              banner={preferences.banner}
              legacyImage={user.banner_url}
              fallbackColor={c.primary}
              height={132}
            >
              <Avatar
                name={user.username}
                uri={avatarUrl}
                size={76}
                frameId={preferences.frameId}
                frameColor={
                  initial.catalog.frames.find((frame) => frame.id === preferences.frameId)?.color
                }
                frameDecoration={
                  initial.catalog.frames.find((frame) => frame.id === preferences.frameId)
                    ?.decoration
                }
              />
            </ProfileBanner>
            <Text
              style={{
                color:
                  preferences.nameStyle.color &&
                  colorValid(preferences.nameStyle.color) &&
                  nameContrast
                    ? preferences.nameStyle.color
                    : previewColors.text,
                fontSize: 23,
                fontWeight: preferences.nameStyle.bold ? '800' : '500',
                fontStyle: preferences.nameStyle.italic ? 'italic' : 'normal',
                textDecorationLine: preferences.nameStyle.underline ? 'underline' : 'none',
              }}
            >
              {profileName(user)}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              {preferences.flag && <ProfileFlag code={preferences.flag} />}{' '}
              {equippedTitle && <ProfileTitle achievement={equippedTitle} />}
            </View>
            <Text style={{ color: previewColors.muted }}>@{user.username}</Text>
            <ProfileExtras preferences={preferences} achievements={initial.achievements} />
          </View>
        </ScopedTheme>
        <Choice options={sections} value={section} onChange={setSection} />
        <View pointerEvents={busy ? 'none' : 'auto'} style={{ gap: 24 }}>
          {section === 'appearance' && (
            <>
              <Heading>Aparência do perfil</Heading>
              <Label muted>
                Essas cores aparecem somente no seu perfil. Visitantes verão a aparência que você
                salvar.
              </Label>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {themes.map((theme) => (
                  <Pressable
                    key={theme.name}
                    accessibilityRole="button"
                    accessibilityLabel={'Tema ' + theme.name}
                    onPress={() =>
                      update('appearance', {
                        backgroundColor: theme.backgroundColor,
                        cardColor: theme.cardColor,
                        accentColor: theme.accentColor,
                        borderColor: theme.borderColor,
                        secondaryColor: theme.accentColor,
                        buttonColor: theme.accentColor,
                      })
                    }
                    style={{
                      minHeight: 48,
                      paddingHorizontal: 16,
                      justifyContent: 'center',
                      backgroundColor: theme.backgroundColor,
                      borderColor: theme.borderColor,
                      borderWidth: 1,
                      borderRadius: 24,
                    }}
                  >
                    <Text style={{ color: colorInk(theme.backgroundColor), fontWeight: '700' }}>
                      {theme.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {(
                [
                  { key: 'backgroundColor', label: 'Fundo do perfil' },
                  { key: 'accentColor', label: 'Cor principal de destaque' },
                  { key: 'secondaryColor', label: 'Cor secundária' },
                  { key: 'cardColor', label: 'Cor dos cartões' },
                  { key: 'borderColor', label: 'Cor das bordas' },
                  { key: 'buttonColor', label: 'Cor dos botões' },
                ] as const
              ).map((item) => (
                <ColorField
                  key={item.key}
                  label={item.label}
                  value={preferences.appearance[item.key]}
                  disabled={busy}
                  onChange={(color) =>
                    update('appearance', { ...preferences.appearance, [item.key]: color })
                  }
                />
              ))}
              <Button
                label="Restaurar aparência padrão"
                secondary
                onPress={() => update('appearance', clone(defaultProfilePreferences.appearance))}
              />
            </>
          )}
          {section === 'name' && (
            <>
              <Heading>Nome e cores</Heading>
              <Button
                label="Editar nome e biografia"
                secondary
                onPress={() => router.push('/edit-profile')}
              />
              <ColorField
                label="Cor do nome"
                value={preferences.nameStyle.color}
                disabled={busy}
                onChange={(color) => update('nameStyle', { ...preferences.nameStyle, color })}
              />
              <Toggle
                label="Negrito"
                value={preferences.nameStyle.bold}
                disabled={busy}
                onChange={(bold) => update('nameStyle', { ...preferences.nameStyle, bold })}
              />
              <Toggle
                label="Itálico"
                value={preferences.nameStyle.italic}
                disabled={busy}
                onChange={(italic) => update('nameStyle', { ...preferences.nameStyle, italic })}
              />
              <Toggle
                label="Sublinhado"
                value={preferences.nameStyle.underline}
                disabled={busy}
                onChange={(underline) =>
                  update('nameStyle', { ...preferences.nameStyle, underline })
                }
              />
              {!nameContrast && (
                <Label>
                  Essa combinação dificulta a leitura. Escolha uma cor com mais contraste para
                  salvar.
                </Label>
              )}
              <Button
                label="Restaurar estilo do nome"
                secondary
                onPress={() => update('nameStyle', { ...defaultProfilePreferences.nameStyle })}
              />
            </>
          )}
          {section === 'identity' && (
            <>
              <Heading>Bandeira</Heading>
              <Field
                label="Buscar país ou bandeira"
                value={flagSearch}
                onChangeText={(value) => {
                  setFlagSearch(value);
                  setFlagLimit(12);
                }}
                editable={!busy}
              />
              <Button label="Remover bandeira" secondary onPress={() => update('flag', null)} />
              <View style={{ gap: 8 }}>
                {flags.slice(0, flagLimit).map((flag) => (
                  <Pressable
                    key={flag.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: flag.id === preferences.flag }}
                    accessibilityLabel={'Escolher bandeira: ' + flag.label}
                    onPress={() => update('flag', flag.id)}
                    style={{
                      minHeight: 56,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      padding: 10,
                      borderRadius: 12,
                      borderWidth: flag.id === preferences.flag ? 2 : 1,
                      borderColor: flag.id === preferences.flag ? c.primary : c.border,
                    }}
                  >
                    <ProfileFlag code={flag.id} />
                    <Text style={{ color: c.text, flex: 1 }}>{flag.label}</Text>
                    <Text style={{ color: c.muted }}>{flag.id.toUpperCase()}</Text>
                  </Pressable>
                ))}
              </View>
              {flags.length > flagLimit && (
                <Button
                  label="Mostrar mais bandeiras"
                  secondary
                  onPress={() => setFlagLimit(flagLimit + 20)}
                />
              )}
              <Heading>Títulos e conquistas</Heading>
              <Label muted>
                Equipe um título e escolha até três conquistas para destacar. O servidor verifica os
                requisitos de desbloqueio.
              </Label>
              {initial.achievements.map((item) => (
                <AchievementRow
                  key={item.id}
                  item={item}
                  disabled={busy}
                  equipped={preferences.equippedTitleId === item.id}
                  featured={preferences.featuredAchievementIds.includes(item.id)}
                  onEquip={() =>
                    update(
                      'equippedTitleId',
                      preferences.equippedTitleId === item.id ? null : item.id
                    )
                  }
                  onFeature={() => {
                    const selected = preferences.featuredAchievementIds.includes(item.id);
                    if (!selected && preferences.featuredAchievementIds.length >= 3) {
                      setNotice('Escolha até três conquistas em destaque.');
                      return;
                    }
                    update(
                      'featuredAchievementIds',
                      selected
                        ? preferences.featuredAchievementIds.filter((id) => id !== item.id)
                        : [...preferences.featuredAchievementIds, item.id]
                    );
                  }}
                />
              ))}
            </>
          )}
          {section === 'frames' && (
            <>
              <Heading>Avatar e molduras</Heading>
              <Button
                label={uploading ? 'Enviando foto…' : 'Escolher foto da galeria'}
                busy={uploading}
                onPress={() => void pickImage('avatar')}
              />
              <Button
                label="Tirar foto com a câmera"
                secondary
                disabled={busy}
                onPress={() => void pickImage('avatar', 'camera')}
              />
              {avatarUrl && (
                <Button
                  label="Remover foto do perfil"
                  secondary
                  disabled={busy}
                  onPress={() => {
                    setAvatarUrl(null);
                    setNotice('Foto removida da prévia. Salve para confirmar.');
                  }}
                />
              )}
              <Label muted>
                Recorte a foto antes de enviar. A prévia mostra a foto dentro da moldura; suas
                alterações só serão aplicadas ao salvar. Imagens de até 5 MB e pelo menos 64 × 64
                pixels.
              </Label>
              <View style={{ gap: 12 }}>
                {initial.catalog.frames.map((frame) => {
                  const locked =
                    !!frame.achievementId &&
                    !initial.achievements.some(
                      (item) => item.id === frame.achievementId && item.unlocked
                    );
                  return (
                    <Pressable
                      key={frame.id}
                      disabled={locked || busy}
                      accessibilityRole="button"
                      accessibilityLabel={frame.name + (locked ? ', conquista necessária' : '')}
                      accessibilityState={{
                        selected: frame.id === preferences.frameId,
                        disabled: locked || busy,
                      }}
                      onPress={() => update('frameId', frame.id)}
                      style={{
                        minHeight: 88,
                        padding: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 16,
                        borderWidth: frame.id === preferences.frameId ? 2 : 1,
                        borderColor: frame.id === preferences.frameId ? c.primary : c.border,
                        borderRadius: 12,
                        opacity: locked ? 0.5 : 1,
                      }}
                    >
                      <Avatar
                        name={user.username}
                        uri={avatarUrl}
                        frameId={frame.id}
                        frameColor={frame.color}
                        frameDecoration={frame.decoration}
                        size={60}
                      />
                      <View style={{ flex: 1, gap: 5 }}>
                        <Text style={{ color: c.text, fontSize: 15, fontWeight: '700' }}>
                          {frame.name}
                        </Text>
                        {locked && (
                          <Text style={{ color: c.muted, fontSize: 13 }}>
                            Desbloqueie a conquista associada.
                          </Text>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
          {section === 'banner' && (
            <>
              <Heading>Banner</Heading>
              <Choice
                value={preferences.banner.mode}
                options={[
                  { value: 'default', label: 'Padrão' },
                  { value: 'color', label: 'Cor sólida' },
                  { value: 'gradient', label: 'Gradiente' },
                  { value: 'image', label: 'Imagem' },
                ]}
                onChange={(mode) =>
                  update('banner', {
                    ...preferences.banner,
                    mode: mode as ProfilePreferences['banner']['mode'],
                  })
                }
              />
              {preferences.banner.mode === 'image' ? (
                <>
                  <Button
                    label="Escolher imagem do banner"
                    busy={uploading}
                    onPress={() => void pickImage('banner')}
                  />
                  <Field
                    label="Posição horizontal (0 a 100)"
                    value={String(preferences.banner.positionX)}
                    keyboardType="number-pad"
                    editable={!busy}
                    onChangeText={(value) =>
                      update('banner', {
                        ...preferences.banner,
                        positionX: Math.max(0, Math.min(100, Number(value) || 0)),
                      })
                    }
                  />
                  <Field
                    label="Posição vertical (0 a 100)"
                    value={String(preferences.banner.positionY)}
                    keyboardType="number-pad"
                    editable={!busy}
                    onChangeText={(value) =>
                      update('banner', {
                        ...preferences.banner,
                        positionY: Math.max(0, Math.min(100, Number(value) || 0)),
                      })
                    }
                  />
                  <Label muted>Use a prévia acima para escolher o enquadramento.</Label>
                </>
              ) : (
                preferences.banner.mode !== 'default' && (
                  <>
                    <ColorField
                      label="Cor do banner"
                      nullable={false}
                      value={preferences.banner.color}
                      disabled={busy}
                      onChange={(color) =>
                        update('banner', { ...preferences.banner, color: color || '#0083FE' })
                      }
                    />
                    {preferences.banner.mode === 'gradient' && (
                      <ColorField
                        label="Segunda cor do banner"
                        nullable={false}
                        value={preferences.banner.secondaryColor}
                        disabled={busy}
                        onChange={(color) =>
                          update('banner', {
                            ...preferences.banner,
                            secondaryColor: color || '#7C3AED',
                          })
                        }
                      />
                    )}
                  </>
                )
              )}
              <Button
                label="Restaurar banner padrão"
                secondary
                onPress={() => update('banner', { ...defaultProfilePreferences.banner })}
              />
            </>
          )}
          {section === 'tags' && (
            <>
              <Heading>Tags e interesses</Heading>
              <Label muted>
                Escolha até dez interesses. Toque em uma tag selecionada para remover.
              </Label>
              <Field
                label="Adicionar tag"
                value={tag}
                onChangeText={setTag}
                maxLength={25}
                editable={!busy}
                onSubmitEditing={() => addTag()}
              />
              <Button label="Adicionar tag" onPress={() => addTag()} disabled={!tag.trim()} />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {preferences.tags.map((item, index) => (
                  <View
                    key={item}
                    style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}
                  >
                    <Button
                      label={'Remover #' + item}
                      secondary
                      onPress={() =>
                        update(
                          'tags',
                          preferences.tags.filter((value) => value !== item)
                        )
                      }
                    />
                    {index > 0 && (
                      <Button
                        label={'Mover #' + item + ' para antes'}
                        secondary
                        onPress={() => {
                          const next = [...preferences.tags];
                          [next[index - 1], next[index]] = [next[index], next[index - 1]];
                          update('tags', next);
                        }}
                      />
                    )}
                  </View>
                ))}
              </View>
              <Label>Sugestões</Label>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {[
                  ...new Set([
                    ...(tagSuggestions.data?.tags ?? []),
                    'developer',
                    'python',
                    'javascript',
                    'react',
                    'linux',
                    'games',
                    'design',
                  ]),
                ]
                  .filter((item) => !preferences.tags.includes(item))
                  .filter((item) => !tagQuery || item.includes(tagQuery))
                  .map((item) => (
                    <Button key={item} secondary label={'#' + item} onPress={() => addTag(item)} />
                  ))}
              </View>
            </>
          )}
          {section === 'studies' && (
            <>
              <Heading>Estudando atualmente</Heading>
              <Label muted>
                Até três tecnologias, disciplinas ou assuntos. Deixe a lista vazia para ocultar a
                seção.
              </Label>
              <Field
                label="Assunto de estudo"
                value={study}
                onChangeText={setStudy}
                maxLength={60}
                editable={!busy}
                onSubmitEditing={() => addStudy()}
              />
              <Button
                label="Adicionar assunto"
                onPress={() => addStudy()}
                disabled={!study.trim()}
              />
              {preferences.studies.map((item) => (
                <Button
                  key={item}
                  secondary
                  label={'Remover ' + item}
                  onPress={() =>
                    update(
                      'studies',
                      preferences.studies.filter((value) => value !== item)
                    )
                  }
                />
              ))}
              <Label>Sugestões</Label>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {[
                  'Python',
                  'React',
                  'Engenharia de Software',
                  'Banco de Dados',
                  'Inteligência Artificial',
                  'Cibersegurança',
                ]
                  .filter((item) => !preferences.studies.includes(item))
                  .map((item) => (
                    <Button key={item} secondary label={item} onPress={() => addStudy(item)} />
                  ))}
              </View>
            </>
          )}
          {section === 'music' && (
            <>
              <Heading>Música do perfil</Heading>
              <Label muted>
                Cole um link de faixa do Spotify. O player oficial só toca quando você escolhe
                reproduzir.
              </Label>
              <Field
                label="Buscar música ou artista"
                value={musicQuery}
                onChangeText={setMusicQuery}
                maxLength={100}
                editable={!busy && !searchMusic.isPending}
                onSubmitEditing={() => {
                  if (musicQuery.trim().length >= 2) searchMusic.mutate();
                }}
              />
              <Button
                label="Buscar no Spotify"
                busy={searchMusic.isPending}
                disabled={busy || musicQuery.trim().length < 2}
                onPress={() => searchMusic.mutate()}
              />
              {searchMusic.data?.configured === false && (
                <Label muted>
                  A busca por nome ainda não está configurada. Cole o link da faixa abaixo para
                  adicionar sua música.
                </Label>
              )}
              {searchMusic.error && (
                <Label>Busca indisponível. Você pode adicionar pelo link abaixo.</Label>
              )}
              {searchMusic.data?.tracks.map((track) => (
                <Button
                  key={track.trackId}
                  secondary
                  label={
                    'Selecionar ' +
                    (track.title || 'Faixa do Spotify') +
                    (track.artist ? ' · ' + track.artist : '')
                  }
                  disabled={busy}
                  onPress={() => {
                    update('music', track);
                    setMusicQuery('');
                    searchMusic.reset();
                  }}
                />
              ))}
              <Field
                label="Link da faixa no Spotify"
                placeholder="https://open.spotify.com/track/…"
                value={musicUrl}
                onChangeText={setMusicUrl}
                maxLength={2048}
                keyboardType="url"
                editable={!busy && !resolveMusic.isPending}
              />
              <Button
                label="Buscar música pelo link"
                busy={resolveMusic.isPending}
                disabled={!musicUrl.trim()}
                onPress={() => resolveMusic.mutate()}
              />
              {resolveMusic.error && <Label>{errorMessage(resolveMusic.error)}</Label>}
              {preferences.music && (
                <Button
                  label="Remover música do perfil"
                  secondary
                  onPress={() => update('music', null)}
                />
              )}
              <Label muted>
                A disponibilidade de reprodução e do catálogo depende do Spotify. O link continua
                disponível caso o player não carregue.
              </Label>
            </>
          )}
          {section === 'chat' && (
            <>
              <Heading>Cores do chat</Heading>
              <Label muted>
                Essas preferências são privadas e alteram somente a forma como você vê as conversas.
              </Label>
              <Choice
                value={chat.mode}
                options={[
                  { value: 'default', label: 'Padrão' },
                  { value: 'dark', label: 'Escuro' },
                  { value: 'custom', label: 'Personalizado' },
                ]}
                onChange={(mode) =>
                  setChat((current) => ({ ...current, mode: mode as ChatPreferences['mode'] }))
                }
              />
              {chat.mode === 'custom' && (
                <>
                  <ColorField
                    label="Cor das mensagens enviadas"
                    value={chat.bubbleColor}
                    disabled={busy}
                    onChange={(bubbleColor) => setChat((current) => ({ ...current, bubbleColor }))}
                  />
                  <ColorField
                    label="Destaque da conversa"
                    value={chat.accentColor}
                    disabled={busy}
                    onChange={(accentColor) => setChat((current) => ({ ...current, accentColor }))}
                  />
                  <ColorField
                    label="Fundo das conversas"
                    value={chat.backgroundColor}
                    disabled={busy}
                    onChange={(backgroundColor) =>
                      setChat((current) => ({ ...current, backgroundColor }))
                    }
                  />
                </>
              )}
              <View
                style={{
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor:
                    chat.mode === 'dark' ? '#000000' : chat.backgroundColor || c.background,
                }}
              >
                <View
                  style={{
                    alignSelf: 'flex-end',
                    backgroundColor: chat.bubbleColor || c.ownMessage,
                    borderRadius: 16,
                    padding: 14,
                  }}
                >
                  <Text style={{ color: colorInk(chat.bubbleColor || c.ownMessage) }}>
                    Sua mensagem de exemplo
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>
        {!valid && <Label>Confira os códigos de cor. Use # e seis caracteres, como #0083FE.</Label>}
      </Screen>
    </View>
  );
}

export function MyAchievements() {
  const q = useCustomization();
  const { colors: c } = useTheme();
  const { session, isPreview } = useSession();
  const [filter, setFilter] = useState('all');
  const [notice, setNotice] = useState('');
  const equip = useMutation({
    mutationFn: (preferences: ProfilePreferences) =>
      send<ProfileCustomizationData>(
        '/api/profile/customization',
        { preferences, version: q.data!.version },
        'PUT'
      ),
    onSuccess: (result) => {
      queryClient.setQueryData(['profile-customization', session?.user.id], result);
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      void queryClient.invalidateQueries({ queryKey: ['profile-customization-public'] });
      void queryClient.invalidateQueries({ queryKey: ['me'] });
      void queryClient.invalidateQueries({ queryKey: ['list'] });
      setNotice('Conquista atualizada no seu perfil.');
    },
  });
  if (!session || isPreview)
    return (
      <Screen title="Minhas conquistas" back>
        <Label>Entre na sua conta para acompanhar suas conquistas reais.</Label>
        <Button label="Entrar" onPress={() => router.push('/auth')} />
      </Screen>
    );
  return (
    <Screen
      title="Minhas conquistas"
      back
      onRefresh={() => void q.refetch()}
      refreshing={q.isRefetching}
    >
      <AsyncState query={q}>
        {q.data && (
          <>
            <Heading>Sua jornada na comunidade</Heading>
            <Label muted>
              {q.data.achievements.filter((item) => item.unlocked).length} de{' '}
              {q.data.achievements.length} conquistas desbloqueadas. Os títulos são concedidos por
              atividade validada no servidor.
            </Label>
            {!!q.data.newUnlocks.length && (
              <Text accessibilityLiveRegion="polite" style={{ color: c.success }}>
                Novas conquistas:{' '}
                {q.data.achievements
                  .filter((item) => q.data!.newUnlocks.includes(item.id))
                  .map((item) => item.name)
                  .join(', ')}
              </Text>
            )}
            <Button
              label="Escolher título e destaques"
              onPress={() => router.push('/personalize?section=identity' as never)}
            />
            <Choice
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: 'Todas' },
                { value: 'unlocked', label: 'Conquistadas' },
                { value: 'locked', label: 'Bloqueadas' },
                { value: 'events', label: 'Eventos' },
              ]}
            />
            {(notice || equip.error) && (
              <Text
                accessibilityLiveRegion="polite"
                style={{ color: equip.error ? c.danger : c.text }}
              >
                {equip.error ? errorMessage(equip.error) : notice}
              </Text>
            )}
            {q.data.achievements
              .filter(
                (item) =>
                  filter === 'all' ||
                  (filter === 'unlocked' && item.unlocked) ||
                  (filter === 'locked' && !item.unlocked) ||
                  (filter === 'events' && !!item.requirement.eventId)
              )
              .map((item) => (
                <AchievementRow
                  key={item.id}
                  item={item}
                  equipped={q.data!.preferences.equippedTitleId === item.id}
                  featured={q.data!.preferences.featuredAchievementIds.includes(item.id)}
                  disabled={equip.isPending}
                  onEquip={() =>
                    equip.mutate({
                      ...q.data!.preferences,
                      equippedTitleId:
                        q.data!.preferences.equippedTitleId === item.id ? null : item.id,
                    })
                  }
                  onFeature={() => {
                    const selected = q.data!.preferences.featuredAchievementIds;
                    if (!selected.includes(item.id) && selected.length >= 3) {
                      setNotice(
                        'Escolha até três conquistas para destacar. Remova uma antes de adicionar outra.'
                      );
                      return;
                    }
                    equip.mutate({
                      ...q.data!.preferences,
                      featuredAchievementIds: selected.includes(item.id)
                        ? selected.filter((id) => id !== item.id)
                        : [...selected, item.id],
                    });
                  }}
                />
              ))}
          </>
        )}
      </AsyncState>
    </Screen>
  );
}
