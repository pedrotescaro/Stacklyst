import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { IconCode, IconPhoto, IconLetterT, IconX } from '~/components/icons';
import {
  Screen,
  Field,
  Button,
  Label,
  Choice,
  AsyncState,
  Avatar,
  IconButton,
} from '~/components/ui';
import { DraftConflict } from '~/components/content';
import { useDraft } from '~/lib/draft';
import { api, send, errorMessage } from '~/lib/api';
import { queryClient } from '~/lib/query';
import { Post } from '~/lib/types';
import { useMe, useSession } from '~/lib/session';
import { config } from '~/lib/config';
import { useTheme } from '~/theme';
interface Composition {
  body: string;
  title: string;
  code: string;
  type: string;
  image: string;
  language: string;
}
const empty: Composition = {
  body: '',
  title: '',
  code: '',
  type: 'discussion',
  image: '',
  language: '',
};
const languages = [
  { value: '', label: 'Sem linguagem' },
  { value: 'JS', label: 'JavaScript' },
  { value: 'TS', label: 'TypeScript' },
  { value: 'PYTHON', label: 'Python' },
  { value: 'JAVA', label: 'Java' },
  { value: 'RUST', label: 'Rust' },
  { value: 'GO', label: 'Go' },
  { value: 'KOTLIN', label: 'Kotlin' },
  { value: 'SWIFT', label: 'Swift' },
  { value: 'CPP', label: 'C++' },
];
function decode(value: string): Composition {
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed.body === 'string') return { ...empty, ...parsed };
  } catch {
    /* Previously saved drafts contained only text. */
  }
  return { ...empty, body: value };
}
export default function Compose() {
  const { isPreview } = useSession();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const me = useMe();
  const [showTitle, setShowTitle] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const { id } = useLocalSearchParams<{ id?: string }>();
  const original = useQuery({
    queryKey: ['post', id],
    queryFn: () => api<Post>('/api/posts/' + id),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
  const initial = id ? (original.data?.body ?? '') : JSON.stringify(empty);
  const draft = useDraft(id ? 'post:' + id : 'post', initial, !id || !!original.data);
  const composition = useMemo(
    () => (id ? { ...empty, body: draft.value } : decode(draft.value)),
    [id, draft.value]
  );
  const latest = useRef(composition);
  useEffect(() => {
    latest.current = composition;
  }, [composition]);
  const change = (field: keyof Composition, value: string) => {
    latest.current = { ...latest.current, [field]: value };
    draft.setValue(JSON.stringify(latest.current));
  };
  const [uploading, setUploading] = useState(false),
    [uploadError, setUploadError] = useState('');
  const m = useMutation({
    mutationFn: () =>
      send(
        '/api/posts' + (id ? '/' + id : ''),
        id
          ? { body: draft.value }
          : {
              body: composition.body,
              title: composition.title || undefined,
              type: composition.type,
              code_snippet: composition.code || null,
              language: composition.language || null,
              image_url: composition.image || null,
            },
        id ? 'PATCH' : 'POST'
      ),
    onSuccess: async () => {
      await draft.clear();
      await queryClient.invalidateQueries({ queryKey: ['list'] });
      await queryClient.invalidateQueries({ queryKey: ['post', id] });
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    },
  });
  const pick = async () => {
    setUploadError('');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (result.canceled) return;
      const a = result.assets[0];
      if (a.fileSize && a.fileSize > 5 * 1024 * 1024)
        throw new Error('A imagem deve ter até 5 MB.');
      setUploading(true);
      const data = new FormData();
      data.append('file', {
        uri: a.uri,
        name: a.fileName || 'image.jpg',
        type: a.mimeType || 'image/jpeg',
      } as unknown as Blob);
      const uploaded = await api<{ url: string }>('/api/upload', { method: 'POST', body: data });
      change('image', uploaded.url);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Falha no upload');
    } finally {
      setUploading(false);
    }
  };
  if (id && !original.data)
    return (
      <Screen title="Editar publicação" back>
        <AsyncState query={original}>{null}</AsyncState>
      </Screen>
    );
  return (
    <Screen
      title={id ? 'Editar publicação' : 'Nova publicação'}
      back
      scroll={false}
      actions={
        <Button
          label={id ? 'Salvar' : 'Publicar'}
          busy={m.isPending}
          disabled={
            !draft.ready ||
            composition.body.trim().length < 10 ||
            uploading ||
            (!id && !!composition.title && composition.title.trim().length < 5)
          }
          onPress={() => m.mutate()}
        />
      }
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{
          padding: 16,
          gap: 16,
          paddingBottom: Math.max(insets.bottom, 16) + 24,
          width: '100%',
          maxWidth: 760,
          alignSelf: 'center',
        }}
      >
        {isPreview && (
          <Label muted>
            Entre na sua conta para escrever e publicar. A demonstração permite apenas explorar as
            telas.
          </Label>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar uri={me.data?.avatar_url} name={me.data?.username ?? 'Você'} size={44} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
              {me.data?.avatar_config?.displayName || me.data?.username || 'Você'}
            </Text>
            <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 21 }}>
              Compartilhe com a comunidade
            </Text>
          </View>
        </View>
        {!id && (
          <>
            <Choice
              value={composition.type}
              onChange={(value) => change('type', value)}
              options={[
                { value: 'discussion', label: 'Compartilhar' },
                { value: 'question', label: 'Perguntar' },
              ]}
            />
            {(showTitle || !!composition.title) && (
              <Field
                label="Título (opcional)"
                value={composition.title}
                editable={draft.ready}
                maxLength={200}
                onChangeText={(value) => change('title', value)}
              />
            )}
          </>
        )}
        <TextInput
          accessibilityLabel="Conteúdo da publicação"
          placeholder="O que você está construindo ou aprendendo?"
          placeholderTextColor={colors.muted}
          selectionColor={colors.primary}
          value={composition.body}
          editable={draft.ready}
          onChangeText={(value) => (id ? draft.setValue(value) : change('body', value))}
          multiline
          maxLength={5000}
          autoCapitalize="sentences"
          textAlignVertical="top"
          style={{
            color: colors.text,
            fontSize: 18,
            lineHeight: 28,
            minHeight: 190,
            paddingVertical: 8,
          }}
        />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <Text
            accessibilityLiveRegion="polite"
            style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}
          >
            {isPreview ? 'Demonstração somente leitura' : draft.status}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 12, fontVariant: ['tabular-nums'] }}>
            {composition.body.length}/5000
          </Text>
        </View>
        {id ? (
          <Label muted>
            A edição preserva título e imagem. Para incluir código, use um bloco Markdown com três
            crases e a linguagem.
          </Label>
        ) : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <IconButton
                label={composition.image ? 'Trocar imagem' : 'Adicionar imagem'}
                onPress={() => {
                  if (draft.ready && !uploading) void pick();
                }}
                icon={<IconPhoto size={23} color={uploading ? colors.muted : colors.primary} />}
              />
              <IconButton
                label={showCode ? 'Ocultar campo de código' : 'Adicionar código'}
                onPress={() => setShowCode(!showCode)}
                icon={
                  <IconCode
                    size={23}
                    color={showCode || composition.code ? colors.primary : colors.muted}
                  />
                }
              />
              <IconButton
                label={showTitle ? 'Ocultar título opcional' : 'Adicionar título opcional'}
                onPress={() => setShowTitle(!showTitle)}
                icon={
                  <IconLetterT
                    size={23}
                    color={showTitle || composition.title ? colors.primary : colors.muted}
                  />
                }
              />
            </View>
            {(showCode || !!composition.code) && (
              <Field
                label="Código (opcional)"
                value={composition.code}
                editable={draft.ready}
                onChangeText={(value) => change('code', value)}
                multiline
                maxLength={10000}
                autoCorrect={false}
                autoCapitalize="none"
                style={{ fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 14 }}
              />
            )}
            <View style={{ gap: 4 }}>
              <Label muted>Linguagem (opcional)</Label>
              <Choice
                value={composition.language}
                onChange={(value) => change('language', value)}
                options={languages}
              />
            </View>
            {uploading && <Label muted>Enviando imagem…</Label>}
            {composition.image && (
              <View>
                <Image
                  source={{
                    uri: composition.image.startsWith('/')
                      ? config.apiUrl + composition.image
                      : composition.image,
                  }}
                  accessibilityLabel="Imagem anexada à publicação"
                  resizeMode="contain"
                  style={{
                    width: '100%',
                    height: 220,
                    borderRadius: 14,
                    backgroundColor: colors.surface,
                  }}
                />
                <View
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    borderRadius: 24,
                    backgroundColor: colors.background,
                  }}
                >
                  <IconButton
                    label="Remover imagem"
                    onPress={() => change('image', '')}
                    icon={<IconX size={21} color={colors.text} />}
                  />
                </View>
              </View>
            )}
          </>
        )}
        <Button
          secondary
          disabled={!draft.ready}
          label="Sincronizar rascunho"
          onPress={draft.sync}
        />
        <DraftConflict
          draft={draft}
          formatValue={
            id
              ? undefined
              : (value) => {
                  const saved = decode(value);
                  return [saved.title, saved.body, saved.code, saved.language, saved.image]
                    .filter(Boolean)
                    .join('\n\n');
                }
          }
        />
        {uploadError && <Label>{uploadError}</Label>}
        {m.error && <Label>{errorMessage(m.error)}</Label>}
        <Label muted>O conteúdo precisa ter pelo menos 10 caracteres.</Label>
      </ScrollView>
    </Screen>
  );
}
