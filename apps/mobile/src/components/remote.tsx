import { ReactNode } from 'react';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { View, RefreshControl, StyleSheet } from 'react-native';
import { api, send, errorMessage } from '../lib/api';
import { Page } from '../lib/types';
import { queryClient } from '../lib/query';
import { Button, Label, Loading, Notice } from './ui';
import { useTheme } from '../theme';

function ListSkeleton({ feed = false }: { feed?: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Carregando conteúdo"
      style={{ paddingTop: 4 }}
    >
      {[0, 1, 2, 3].map((item) => (
        <View
          key={item}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            flexDirection: 'row',
            gap: 12,
            paddingHorizontal: feed ? 16 : 0,
            paddingVertical: 18,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
          }}
        >
          <View
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.elevated }}
          />
          <View style={{ flex: 1, gap: 10, paddingTop: 3 }}>
            <View
              style={{
                width: '42%',
                height: 13,
                borderRadius: 4,
                backgroundColor: colors.elevated,
              }}
            />
            <View
              style={{ width: '65%', height: 10, borderRadius: 4, backgroundColor: colors.surface }}
            />
            <View
              style={{
                width: '100%',
                height: 13,
                marginTop: 5,
                borderRadius: 4,
                backgroundColor: colors.elevated,
              }}
            />
            <View
              style={{
                width: '90%',
                height: 13,
                borderRadius: 4,
                backgroundColor: colors.elevated,
              }}
            />
            {feed && (
              <View
                style={{
                  width: '60%',
                  height: 13,
                  borderRadius: 4,
                  backgroundColor: colors.elevated,
                }}
              />
            )}
          </View>
        </View>
      ))}
    </View>
  );
}
export function RemoteList<T extends { id: string }>({
  path,
  render,
  header,
  chronological = false,
  edgeToEdge = false,
  loadingVariant = 'list',
  empty,
  onRefreshed,
  refetchInterval,
  filter,
}: {
  path: string;
  render: (item: T, index: number, rows: T[]) => ReactNode;
  header?: ReactNode;
  chronological?: boolean;
  edgeToEdge?: boolean;
  loadingVariant?: 'list' | 'feed';
  empty?: ReactNode;
  onRefreshed?: () => void;
  refetchInterval?: number;
  filter?: (item: T) => boolean;
}) {
  const { colors } = useTheme();
  const q = useInfiniteQuery({
    queryKey: ['list', path],
    initialPageParam: '',
    refetchInterval,
    queryFn: ({ pageParam, signal }) =>
      api<Page<T>>(
        path + (path.includes('?') ? '&' : '?') + 'cursor=' + encodeURIComponent(pageParam),
        { signal }
      ),
    getNextPageParam: (p) => p.nextCursor || undefined,
  });
  const rows = [
    ...new Map(q.data?.pages.flatMap((p) => p.items).map((i) => [i.id, i])).values(),
  ].filter((item) => !filter || filter(item));
  if (chronological) rows.reverse();
  const older = () => {
    if (q.hasNextPage && !q.isFetching) void q.fetchNextPage();
  };
  return (
    <View style={{ flex: 1, width: '100%', maxWidth: 760, alignSelf: 'center' }}>
      <FlashList
        data={rows}
        keyExtractor={(i) => i.id}
        renderItem={({ item, index }) => <>{render(item, index, rows)}</>}
        ListHeaderComponent={
          <>
            {header}
            {q.error && <Notice error={q.error} retry={() => q.refetch()} />}
          </>
        }
        ListEmptyComponent={
          <>
            {q.isPending ? (
              <ListSkeleton feed={loadingVariant === 'feed'} />
            ) : q.error ? null : (
              (empty ?? <Notice />)
            )}
          </>
        }
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.surface}
            refreshing={q.isRefetching && !q.isFetchingNextPage}
            onRefresh={async () => {
              const result = await q.refetch();
              if (!result.isError) onRefreshed?.();
            }}
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
        contentContainerStyle={{
          paddingHorizontal: edgeToEdge ? 0 : 16,
          paddingBottom: edgeToEdge ? 104 : 32,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </View>
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
