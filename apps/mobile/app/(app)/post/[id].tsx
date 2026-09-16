import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { View } from 'react-native';
import { Screen, AsyncState, Field, Button, Label, styles, RowLink } from '~/components/ui';
import { Action } from '~/components/remote';
import { RichText } from '~/components/content';
import { PostCard } from '~/features/feed/PostCard';
import { Post, Answer } from '~/lib/types';
import { api, send, errorMessage } from '~/lib/api';
import { useMe } from '~/lib/session';
import { queryClient } from '~/lib/query';
import { useDraft } from '~/lib/draft';
export default function Detail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useQuery({ queryKey: ['post', id], queryFn: () => api<Post>('/api/posts/' + id) });
  const me = useMe();
  const draft = useDraft('reply:' + id);
  const [reason, setReason] = useState('');
  const [report, setReport] = useState(false);
  const reply = useMutation({
    mutationFn: () => send('/api/posts/' + id + '/answer', { body: draft.value }),
    onSuccess: () => {
      draft.clear();
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
  });
  const owner = q.data?.author_id === me.data?.id;
  function answer(a: Answer) {
    return (
      <View key={a.id} style={styles.separator}>
        <RowLink
          title={'@' + a.author.username}
          onPress={() => router.push(('/profile/' + a.author.username) as never)}
        />
        <RichText body={a.body} />
        {a.is_accepted && <Label>Resposta aceita</Label>}
        {owner && !a.is_accepted && (
          <Action label="Aceitar resposta" path={'/api/answers/' + a.id + '/accept'} />
        )}
        <View style={{ paddingLeft: 16 }}>{a.replies?.map(answer)}</View>
      </View>
    );
  }
  return (
    <Screen title="Publicação" back>
      <AsyncState query={q}>
        {q.data && (
          <>
            <PostCard post={q.data} detail />
            {owner && (
              <>
                <Button
                  secondary
                  label="Editar"
                  onPress={() => router.push(('/compose?id=' + id) as never)}
                />
                <Action
                  label="Excluir publicação"
                  path={'/api/posts/' + id}
                  method="DELETE"
                  confirmText="Excluir esta publicação e suas respostas?"
                  onSuccess={() => router.back()}
                />
              </>
            )}
            {q.data.answers?.map(answer)}
            <Field
              label="Escreva uma resposta"
              value={draft.value}
              onChangeText={draft.setValue}
              multiline
            />
            <Button
              label="Responder"
              disabled={draft.value.trim().length < 5}
              busy={reply.isPending}
              onPress={() => reply.mutate()}
            />
            {reply.error && <Label>{errorMessage(reply.error)}</Label>}
            <Button secondary label="Denunciar publicação" onPress={() => setReport(!report)} />
            {report && (
              <>
                <Field label="Motivo da denúncia" value={reason} onChangeText={setReason} />
                <Action
                  label="Enviar denúncia"
                  path={'/api/posts/' + id + '/report'}
                  body={{ reason }}
                  onSuccess={() => setReport(false)}
                />
              </>
            )}
          </>
        )}
      </AsyncState>
    </Screen>
  );
}
