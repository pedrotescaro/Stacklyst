import { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRecyclingState } from '@shopify/flash-list';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Avatar } from '~/components/ui';
import { ProfileName } from '~/components/ProfileName';
import { ActionMenu } from '~/components/ActionMenu';
import { RichText, CodeBlock } from '~/components/content';
import {
  IconBookmark,
  IconCheck,
  IconHeart,
  IconMessageCircle,
  IconShare,
} from '~/components/icons';
import { Answer } from '~/lib/types';
import { errorMessage, send } from '~/lib/api';
import { queryClient } from '~/lib/query';
import { config } from '~/lib/config';
import { hasCodeBlock } from '~/lib/code-snippets';
import { useTheme } from '~/theme';
import { PostAction, timeLabel } from './PostCard';

/** Local reply bookmarks are isolated by account and confirmed only after storage succeeds. */
export function useSavedReplies(userId: string | undefined, enabled = true) {
  const queryKey = ['saved-replies', userId];
  const storageKey = 'stacklyst:' + userId + ':saved-replies';
  const q = useQuery({
    queryKey,
    enabled: !!userId && enabled,
    retry: false,
    queryFn: async () => {
      const raw = await AsyncStorage.getItem(storageKey);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed) || parsed.some((id) => typeof id !== 'string'))
        throw new Error('Não foi possível ler suas respostas salvas neste aparelho.');
      return parsed as string[];
    },
  });
  const save = useMutation({
    mutationFn: async (answerId: string) => {
      if (!enabled || !userId || !q.data)
        throw new Error('Suas respostas salvas ainda estão carregando.');
      const ids = q.data.includes(answerId)
        ? q.data.filter((id) => id !== answerId)
        : [...q.data, answerId];
      await AsyncStorage.setItem(storageKey, JSON.stringify(ids));
      return ids;
    },
    onSuccess: (ids) => queryClient.setQueryData(queryKey, ids),
  });
  return { ...q, save, ids: enabled ? (q.data ?? []) : [] };
}

export type ThreadAnswerProps = {
  answer: Answer;
  postId: string;
  isPostOwner: boolean;
  disabled?: boolean;
  savedIds: string[];
  saving?: boolean;
  onReply: (answer: Answer) => void;
  onToggleSaved: (answerId: string) => void;
  depth?: number;
  parentUsername?: string;
  continues?: boolean;
};

export function ThreadAnswer({
  answer,
  postId,
  isPostOwner,
  disabled = false,
  savedIds,
  saving = false,
  onReply,
  onToggleSaved,
  depth = 0,
  parentUsername,
  continues = false,
}: ThreadAnswerProps) {
  const { colors: c } = useTheme();
  const serverVote = answer.votes?.[0]?.value ?? 0;
  const serverScore = answer.upvotes ?? 0;
  const [vote, setVote] = useRecyclingState(serverVote, [serverVote]);
  const [score, setScore] = useRecyclingState(serverScore, [serverScore]);
  const [shareError, setShareError] = useState('');
  const saved = savedIds.includes(answer.id);
  const replies = answer.replies ?? [];
  const m = useMutation({
    mutationFn: ({ action, value }: { action: 'vote' | 'accept'; value?: number }) =>
      send<{ upvotes?: number }>(
        '/api/answers/' + answer.id + '/' + action,
        action === 'vote' ? { value } : {}
      ),
    onMutate: ({ action, value = 0 }) => {
      const previous = { vote, score };
      if (action === 'vote') {
        setVote(value);
        setScore(score + value - vote);
      }
      return previous;
    },
    onError: (_error, _variables, previous) => {
      if (previous) {
        setVote(previous.vote);
        setScore(previous.score);
      }
    },
    onSuccess: (data) => {
      if (typeof data.upvotes === 'number') setScore(data.upvotes);
      void queryClient.invalidateQueries({ queryKey: ['post', postId] });
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
  const openProfile = () => router.push(('/profile/' + answer.author.username) as never);
  const share = async () => {
    setShareError('');
    try {
      await Share.share({ message: config.apiUrl + '/post/' + postId + '#answer-' + answer.id });
    } catch {
      setShareError('Não foi possível compartilhar esta resposta. Tente novamente.');
    }
  };
  const elapsed = timeLabel(answer.created_at);
  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 10, paddingTop: 12 }}>
        <View style={{ width: 40, alignItems: 'center' }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={'Abrir perfil de ' + answer.author.username}
            onPress={openProfile}
            style={({ pressed }) => ({
              minWidth: 44,
              minHeight: 44,
              alignItems: 'center',
              opacity: pressed ? 0.65 : 1,
            })}
          >
            <Avatar
              uri={answer.author.avatar_url}
              name={answer.author.username}
              size={38}
              profileStyle={answer.author.avatar_config?.profileStyle}
            />
          </Pressable>
          {(replies.length > 0 || continues) && (
            <View
              accessibilityElementsHidden
              style={{
                flex: 1,
                width: 1,
                minHeight: 12,
                marginTop: 2,
                marginBottom: -12,
                backgroundColor: c.socialBorder,
              }}
            />
          )}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 32 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={'Abrir perfil de ' + answer.author.username}
              onPress={openProfile}
              style={({ pressed }) => ({
                flex: 1,
                minWidth: 0,
                minHeight: 44,
                justifyContent: 'center',
                opacity: pressed ? 0.65 : 1,
              })}
            >
              <Text numberOfLines={1} style={{ color: c.muted, fontSize: 13, lineHeight: 20 }}>
                <ProfileName
                  user={answer.author}
                  style={{ color: c.text, fontWeight: '700', fontSize: 15 }}
                />
                {' @' + answer.author.username}
                {elapsed ? ' · ' + elapsed : ''}
              </Text>
            </Pressable>
            {isPostOwner && !answer.is_accepted && (
              <ActionMenu
                label={'Opções da resposta de ' + answer.author.username}
                disabled={disabled || m.isPending}
                items={[
                  { label: 'Aceitar resposta', onPress: () => m.mutate({ action: 'accept' }) },
                ]}
              />
            )}
          </View>
          {parentUsername && (
            <Text style={{ color: c.muted, fontSize: 12, lineHeight: 18, marginBottom: 2 }}>
              Respondendo a <Text style={{ color: c.primary }}>@{parentUsername}</Text>
            </Text>
          )}
          <RichText body={answer.body} inset={92} />
          {answer.code_snippet && !hasCodeBlock(answer.body, answer.code_snippet) && (
            <CodeBlock code={answer.code_snippet} />
          )}
          {answer.is_accepted && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <IconCheck size={14} color={c.success} strokeWidth={2.5} />
              <Text style={{ color: c.success, fontSize: 12, fontWeight: '600' }}>
                Resposta aceita
              </Text>
            </View>
          )}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginLeft: -10,
              marginVertical: 2,
            }}
          >
            <PostAction
              label={'Responder a @' + answer.author.username}
              count={replies.length || undefined}
              busy={disabled}
              onPress={() => onReply(answer)}
              icon={<IconMessageCircle size={18} color={c.muted} strokeWidth={1.8} />}
            />
            <PostAction
              label={
                (vote === 1 ? 'Descurtir resposta. ' : 'Curtir resposta. ') + score + ' curtidas'
              }
              count={score}
              active={vote === 1}
              activeColor={c.like}
              busy={disabled || m.isPending}
              onPress={() => m.mutate({ action: 'vote', value: vote === 1 ? 0 : 1 })}
              icon={
                <IconHeart
                  size={18}
                  strokeWidth={1.8}
                  color={vote === 1 ? c.like : c.muted}
                  fill={vote === 1 ? c.like : 'none'}
                />
              }
            />
            <PostAction
              label={
                saved
                  ? 'Remover resposta dos salvos neste aparelho'
                  : 'Salvar resposta neste aparelho'
              }
              active={saved}
              busy={disabled || saving}
              onPress={() => onToggleSaved(answer.id)}
              icon={
                <IconBookmark
                  size={18}
                  strokeWidth={1.8}
                  color={saved ? c.primary : c.muted}
                  fill={saved ? c.primary : 'none'}
                />
              }
            />
            <PostAction
              label="Compartilhar resposta"
              onPress={share}
              icon={<IconShare size={18} color={c.muted} strokeWidth={1.8} />}
            />
          </View>
          {(m.error || shareError) && (
            <Text
              accessibilityLiveRegion="polite"
              style={{ color: c.danger, fontSize: 13, lineHeight: 19, marginBottom: 10 }}
            >
              {m.error ? errorMessage(m.error) : shareError}
            </Text>
          )}
        </View>
      </View>
      {replies.map((child, index) => (
        <ThreadAnswer
          key={child.id}
          answer={child}
          postId={postId}
          isPostOwner={isPostOwner}
          disabled={disabled}
          savedIds={savedIds}
          saving={saving}
          onReply={onReply}
          onToggleSaved={onToggleSaved}
          depth={depth + 1}
          parentUsername={answer.author.username}
          continues={index < replies.length - 1 || continues}
        />
      ))}
      {depth === 0 && (
        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.socialBorder }} />
      )}
    </View>
  );
}
