import { ReactNode } from 'react';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { View, RefreshControl } from 'react-native';
import { api, send, errorMessage } from '../lib/api';
import { Page } from '../lib/types';
import { queryClient } from '../lib/query';
import { Button, Label, Loading, Notice } from './ui';
import { colors } from '../theme';
export function RemoteList<T extends { id: string }>({
  path,
  render,
  header,
  chronological = false,
}: {
  path: string;
  render: (item: T) => ReactNode;
  header?: ReactNode;
  chronological?: boolean;
}) {
  const q = useInfiniteQuery({
    queryKey: ['list', path],
    initialPageParam: '',
    queryFn: ({ pageParam, signal }) =>
      api<Page<T>>(
        path + (path.includes('?') ? '&' : '?') + 'cursor=' + encodeURIComponent(pageParam),
        { signal }
      ),
    getNextPageParam: (p) => p.nextCursor || undefined,
  });
  const rows = [...new Map(q.data?.pages.flatMap((p) => p.items).map((i) => [i.id, i])).values()];
  if (chronological) rows.reverse();
  const older = () => {
    if (q.hasNextPage && !q.isFetching) void q.fetchNextPage();
  };
  return (
    <FlashList
      data={rows}
      keyExtractor={(i) => i.id}
      renderItem={({ item }) => <>{render(item)}</>}
      ListHeaderComponent={
        <>
          {header}
          {q.error && <Notice error={q.error} retry={() => q.refetch()} />}
        </>
      }
      ListEmptyComponent={q.isPending ? <Loading /> : q.error ? null : <Notice />}
      refreshControl={
        <RefreshControl
          tintColor={colors.primary}
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
        />
      }
      onEndReached={chronological ? undefined : older}
      onStartReached={chronological ? older : undefined}
      onEndReachedThreshold={0.4}
      onStartReachedThreshold={0.1}
      maintainVisibleContentPosition={
        chronological
          ? { startRenderingFromBottom: true, autoscrollToBottomThreshold: 0.1 }
          : undefined
      }
      ListFooterComponent={q.isFetchingNextPage ? <Loading /> : null}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
    />
  );
}
export function Action({
  label,
  path,
  body = {},
  method = 'POST',
  onSuccess,
  confirmText,
  secondary = false,
}: {
  label: string;
  path: string;
  body?: unknown;
  method?: string;
  onSuccess?: (data: any) => void;
  confirmText?: string;
  secondary?: boolean;
}) {
  const m = useMutation({
    mutationFn: () => send<any>(path, body, method),
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      onSuccess?.(data);
    },
  });
  const act = () => m.mutate();
  return (
    <View style={{ gap: 8 }}>
      <Button
        secondary={secondary}
        busy={m.isPending}
        label={label}
        onPress={() => {
          if (confirmText) {
            import('./ui').then(({ confirm }) => confirm(label, confirmText, act));
          } else act();
        }}
      />
      {m.error && <Label>{errorMessage(m.error)}</Label>}
      {m.isSuccess && !onSuccess && <Label>Alteração confirmada.</Label>}
    </View>
  );
}
