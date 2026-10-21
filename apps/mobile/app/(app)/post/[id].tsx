import { useEffect, useRef, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen, AsyncState, Avatar, Button, Field, IconButton, confirm } from '~/components/ui';
import { ActionMenu } from '~/components/ActionMenu';
import { CompactComposer } from '~/components/CompactComposer';
import { SnippetComposer } from '~/components/SnippetComposer';
import { IconCode, IconX } from '~/components/icons';
import { PostCard } from '~/features/feed/PostCard';
import { ThreadAnswer, useSavedReplies } from '~/features/feed/ThreadAnswer';
import { Post, Answer } from '~/lib/types';
import { api, send, errorMessage } from '~/lib/api';
import { useMe, useSession } from '~/lib/session';
import { queryClient } from '~/lib/query';
import { useDraft } from '~/lib/draft';
import { appendCodeBlock } from '~/lib/code-snippets';
import { useTheme } from '~/theme';

export default function Detail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PostDetail key={id} id={id} />;
}

export function PostDetail({ id }: { id: string }) {
  const { colors: c } = useTheme();
  const insets = useSafeAreaInsets();
  const q = useQuery({ queryKey: ['post', id], queryFn: () => api<Post>('/api/posts/' + id) });
  const me = useMe();
  const { session, isPreview } = useSession();
  const input = useRef<TextInput>(null);
  const focusAfterLoad = useRef(false);
  const [replyTo, setReplyTo] = useState<Answer | null>(null);
  const draftKey = 'reply:' + id + (replyTo ? ':answer:' + replyTo.id : '');
  const draft = useDraft(draftKey);
  const snippet = useDraft(draftKey + ':snippet');
  const snippetLanguage = useDraft(draftKey + ':snippet-language', 'JS');
  const [showCode, setShowCode] = useState(false);
  const [reason, setReason] = useState('');
  const [report, setReport] = useState(false);
  const [notice, setNotice] = useState('');
  const saved = useSavedReplies(session?.user.id, !isPreview);
  const replyBody = appendCodeBlock(draft.value, snippet.value, snippetLanguage.value);
  const reply = useMutation({
    mutationFn: () =>
      send('/api/posts/' + id + '/answer', {
        body: replyBody,
        ...(replyTo ? { parent_answer_id: replyTo.id } : {}),
      }),
    onSuccess: async () => {
      await Promise.allSettled([draft.clear(), snippet.clear()]);
      setReplyTo(null);
      setShowCode(false);
      setNotice('Resposta publicada.');
      void queryClient.invalidateQueries({ queryKey: ['post', id] });
      void queryClient.invalidateQueries({ queryKey: ['list'] });
    },
  });
  const remove = useMutation({
    mutationFn: () => send('/api/posts/' + id, {}, 'DELETE'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['list'] });
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      if (router.canGoBack()) router.back();
      else router.replace('/');
    },
  });
  const reportMutation = useMutation({
    mutationFn: () => send('/api/posts/' + id + '/report', { reason: reason.trim() }),
    onSuccess: () => {
      setReport(false);
      setReason('');
      setNotice('Denúncia enviada.');
    },
  });
  const owner = q.data?.author_id === me.data?.id;
  const editing =
    !isPreview &&
    !!session &&
    draft.ready &&
    snippet.ready &&
    snippetLanguage.ready &&
    !reply.isPending;
  useEffect(() => {
    if (editing && focusAfterLoad.current) {
      input.current?.focus();
      focusAfterLoad.current = false;
    }
  }, [editing, replyTo?.id]);
  const beginReply = (answer: Answer | null) => {
    if (!editing) return;
    if (answer?.id === replyTo?.id) {
      input.current?.focus();
      focusAfterLoad.current = false;
    } else focusAfterLoad.current = true;
    setReplyTo(answer);
    setNotice('');
    reply.reset();
  };
  const toggleSaved = (answerId: string) => {
    const wasSaved = saved.ids.includes(answerId);
    setNotice('');
    saved.save.mutate(answerId, {
      onSuccess: () =>
        setNotice(
          wasSaved
            ? 'Resposta removida dos salvos neste aparelho.'
            : 'Resposta salva neste aparelho.'
        ),
    });
  };
  const menuItems = [
    ...(owner
      ? [
          {
            label: 'Editar publicação',
            onPress: () => router.push(('/compose?id=' + id) as never),
          },
          {
            label: 'Excluir publicação',
            destructive: true,
            onPress: () =>
              confirm('Excluir publicação', 'Excluir esta publicação e suas respostas?', () =>
                remove.mutate()
              ),
          },
        ]
      : []),
    {
      label: 'Denunciar publicação',
      destructive: true,
      onPress: () => {
        reportMutation.reset();
        setReport(true);
      },
    },
  ];
  return (
    <Screen title="Publicação" back scroll={false}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          width: '100%',
          maxWidth: 760,
          alignSelf: 'center',
          flexGrow: 1,
          paddingBottom: 16,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={q.isRefetching}
            onRefresh={() => void q.refetch()}
            tintColor={c.primary}
            colors={[c.primary]}
          />
        }
      >
        <AsyncState query={q}>
          {q.data && (
            <>
              <PostCard
                post={q.data}
                detail
                onReply={() => beginReply(null)}
                headerActions={
                  <ActionMenu
                    label="Opções da publicação"
                    items={menuItems}
                    disabled={isPreview || remove.isPending}
                  />
                }
              />
              {remove.error && (
                <Text accessibilityLiveRegion="polite" style={{ padding: 16, color: c.danger }}>
                  {errorMessage(remove.error)}
                </Text>
              )}
              <View style={{ paddingHorizontal: 16 }}>
                {q.data.answers?.map((answer) => (
                  <ThreadAnswer
                    key={answer.id}
                    answer={answer}
                    postId={id}
                    isPostOwner={owner}
                    disabled={isPreview || !session || reply.isPending}
                    savedIds={saved.ids}
                    saving={saved.isPending || !!saved.error || saved.save.isPending}
                    onReply={beginReply}
                    onToggleSaved={toggleSaved}
                  />
                ))}
                {!q.data.answers?.length && (
                  <Text
                    style={{ color: c.muted, paddingVertical: 28, fontSize: 15, lineHeight: 22 }}
                  >
                    Seja a primeira pessoa a responder.
                  </Text>
                )}
                {!!saved.error && !isPreview && (
                  <View style={{ paddingVertical: 12, gap: 8 }}>
                    <Text style={{ color: c.danger, fontSize: 13, lineHeight: 19 }}>
                      Não foi possível carregar as respostas salvas neste aparelho.
                    </Text>
                    <Button
                      label="Tentar novamente"
                      secondary
                      onPress={() => void saved.refetch()}
                    />
                  </View>
                )}
              </View>
            </>
          )}
        </AsyncState>
      </ScrollView>
      {q.data && (
        <View
          style={{
            width: '100%',
            maxWidth: 760,
            alignSelf: 'center',
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: c.socialBorder,
            backgroundColor: c.background,
          }}
        >
          {replyTo && (
            <View
              style={{
                paddingLeft: 16,
                paddingRight: 4,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text numberOfLines={1} style={{ color: c.muted, fontSize: 13, flex: 1 }}>
                Respondendo a <Text style={{ color: c.primary }}>@{replyTo.author.username}</Text>
              </Text>
              <IconButton
                label="Cancelar resposta ao comentário"
                disabled={reply.isPending}
                onPress={() => beginReply(null)}
                icon={<IconX size={18} color={c.muted} />}
              />
            </View>
          )}
          {(reply.error || saved.save.error || notice) && (
            <Text
              accessibilityLiveRegion="polite"
              style={{
                color: reply.error || saved.save.error ? c.danger : c.muted,
                paddingHorizontal: 16,
                paddingTop: 8,
                fontSize: 13,
                lineHeight: 19,
              }}
            >
              {reply.error
                ? errorMessage(reply.error)
                : saved.save.error
                  ? 'Não foi possível salvar a resposta neste aparelho. Tente novamente.'
                  : notice}
            </Text>
          )}
          {showCode && (
            <ScrollView
              style={{ maxHeight: 260 }}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 8 }}
            >
              <SnippetComposer
                value={snippet.value}
                onChange={snippet.setValue}
                language={snippetLanguage.value}
                onLanguageChange={snippetLanguage.setValue}
                editable={editing}
                maxLength={Math.max(0, 4900 - draft.value.length)}
              />
            </ScrollView>
          )}
          {replyBody.length > 5000 && (
            <Text
              accessibilityLiveRegion="polite"
              style={{ color: c.danger, paddingHorizontal: 16, paddingTop: 8, fontSize: 13 }}
            >
              A resposta com o código deve ter até 5.000 caracteres.
            </Text>
          )}
          <CompactComposer
            inputRef={input}
            value={draft.value}
            onChangeText={draft.setValue}
            onSend={() => reply.mutate()}
            placeholder="Postar sua resposta"
            sendLabel="Publicar resposta"
            disabled={!editing || replyBody.trim().length < 5 || replyBody.length > 5000}
            editable={editing}
            busy={reply.isPending}
            maxLength={5000}
            leading={<Avatar uri={me.data?.avatar_url} name={me.data?.username ?? 'S'} size={30} />}
            actions={
              <IconButton
                label={
                  showCode
                    ? 'Ocultar editor de código'
                    : snippet.value
                      ? 'Editar código da resposta'
                      : 'Adicionar código à resposta'
                }
                disabled={!editing}
                onPress={() => setShowCode(!showCode)}
                icon={
                  <IconCode size={20} color={showCode || snippet.value ? c.primary : c.muted} />
                }
              />
            }
          />
        </View>
      )}
      <Modal
        visible={report}
        transparent
        animationType="none"
        onRequestClose={() => !reportMutation.isPending && setReport(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, backgroundColor: '#00000099', justifyContent: 'flex-end' }}
        >
          <ScrollView
            accessibilityViewIsModal
            keyboardShouldPersistTaps="handled"
            style={{
              width: '100%',
              maxWidth: 760,
              alignSelf: 'center',
              flexGrow: 0,
              maxHeight: '90%',
            }}
            contentContainerStyle={{
              backgroundColor: c.background,
              padding: 20,
              paddingBottom: Math.max(20, insets.bottom + 12),
              borderTopWidth: 1,
              borderColor: c.socialBorder,
              gap: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                accessibilityRole="header"
                style={{ color: c.text, flex: 1, fontSize: 20, fontWeight: '700' }}
              >
                Denunciar publicação
              </Text>
              <IconButton
                label="Cancelar denúncia"
                disabled={reportMutation.isPending}
                onPress={() => setReport(false)}
                icon={<IconX size={22} color={c.text} />}
              />
            </View>
            <Field
              label="Motivo da denúncia"
              value={reason}
              onChangeText={setReason}
              multiline
              maxLength={1000}
              editable={!reportMutation.isPending}
              autoFocus
            />
            {reportMutation.error && (
              <Text accessibilityLiveRegion="polite" style={{ color: c.danger }}>
                {errorMessage(reportMutation.error)}
              </Text>
            )}
            <Button
              label="Enviar denúncia"
              disabled={!reason.trim() || isPreview}
              busy={reportMutation.isPending}
              onPress={() => reportMutation.mutate()}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}
