import { useRef, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Screen, Field, Button, Label, Choice, AsyncState } from '~/components/ui';
import { DraftConflict } from '~/components/content';
import { useDraft } from '~/lib/draft';
import { api, send, errorMessage } from '~/lib/api';
import { queryClient } from '~/lib/query';
import { Post } from '~/lib/types';
interface Composition {
  body: string;
  title: string;
  code: string;
  type: string;
  image: string;
}
const empty: Composition = { body: '', title: '', code: '', type: 'discussion', image: '' };
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
  const { id } = useLocalSearchParams<{ id?: string }>();
  const original = useQuery({
    queryKey: ['post', id],
    queryFn: () => api<Post>('/api/posts/' + id),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
  const initial = id ? (original.data?.body ?? '') : JSON.stringify(empty);
  const draft = useDraft(id ? 'post:' + id : 'post', initial, !id || !!original.data);
  const composition = id ? { ...empty, body: draft.value } : decode(draft.value);
  const latest = useRef(composition);
  latest.current = composition;
  const change = (field: keyof Composition, value: string) =>
    draft.setValue(JSON.stringify({ ...latest.current, [field]: value }));
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
    <Screen title={id ? 'Editar publicação' : 'Nova publicação'} back>
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
          <Field
            label="Título (opcional)"
            value={composition.title}
            editable={draft.ready}
            maxLength={200}
            onChangeText={(value) => change('title', value)}
          />
        </>
      )}
      <Field
        label="O que você está construindo ou aprendendo?"
        value={composition.body}
        editable={draft.ready}
        onChangeText={(value) => (id ? draft.setValue(value) : change('body', value))}
        multiline
        maxLength={5000}
      />
      <Label muted>
        {draft.status} · {composition.body.length}/5000
      </Label>
      {id ? (
        <Label muted>
          A edição preserva título e imagem. Para incluir código, use um bloco Markdown com três
          crases e a linguagem.
        </Label>
      ) : (
        <>
          <Field
            label="Código (opcional)"
            value={composition.code}
            editable={draft.ready}
            onChangeText={(value) => change('code', value)}
            multiline
            maxLength={10000}
          />
          <Button
            secondary
            disabled={!draft.ready}
            label={composition.image ? 'Trocar imagem' : 'Adicionar imagem'}
            busy={uploading}
            onPress={pick}
          />
          {composition.image && (
            <Button secondary label="Remover imagem" onPress={() => change('image', '')} />
          )}
        </>
      )}
      <Button secondary disabled={!draft.ready} label="Sincronizar rascunho" onPress={draft.sync} />
      <DraftConflict
        draft={draft}
        formatValue={
          id
            ? undefined
            : (value) => {
                const saved = decode(value);
                return [saved.title, saved.body, saved.code, saved.image]
                  .filter(Boolean)
                  .join('\n\n');
              }
        }
      />
      {uploadError && <Label>{uploadError}</Label>}
      {m.error && <Label>{errorMessage(m.error)}</Label>}
      <Button
        label={id ? 'Salvar alterações' : 'Publicar'}
        busy={m.isPending}
        disabled={
          !draft.ready ||
          composition.body.trim().length < 10 ||
          uploading ||
          (!id && !!composition.title && composition.title.trim().length < 5)
        }
        onPress={() => m.mutate()}
      />
    </Screen>
  );
}
