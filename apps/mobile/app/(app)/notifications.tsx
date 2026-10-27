import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  IconHeart,
  IconAt,
  IconBell,
  IconMessageCircle,
  IconSwords,
  IconTrophy,
} from '~/components/icons';
import { Screen, Avatar, Notice } from '~/components/ui';
import { Action, RemoteList } from '~/components/remote';
import { Person } from '~/lib/types';
import { notificationDestination } from '~/lib/links';
import { useTheme } from '~/theme';

interface NotificationEntry {
  id: string;
  title: string;
  content: string;
  link?: string | null;
  type?: string;
  is_read?: boolean;
  created_at?: string;
  actor?: Person | null;
  // Local demonstration fixtures also accept the former mobile representation.
  read?: boolean;
  createdAt?: string;
}

function timestamp(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}

function NotificationRow({ item }: { item: NotificationEntry }) {
  const { colors } = useTheme();
  const read = item.is_read ?? item.read ?? false;
  const destination = notificationDestination(item);
  const actorDestination = notificationDestination({ actor: item.actor });
  const title = item.type === 'LIKE' ? 'Nova curtida' : item.title;
  const content =
    item.type === 'LIKE'
      ? item.actor
        ? `@${item.actor.username} curtiu sua publicação.`
        : 'Sua publicação recebeu uma curtida.'
      : item.content;
  const TypeIcon =
    item.type === 'LIKE'
      ? IconHeart
      : item.type === 'ANSWER'
        ? IconMessageCircle
        : item.type === 'DUEL'
          ? IconSwords
          : item.type === 'XP' || item.type === 'XP_MILESTONE' || item.type === 'QUIZ_CORRECT'
            ? IconTrophy
            : item.type === 'MENTION'
              ? IconAt
              : IconBell;
  return (
    <Pressable
      accessibilityRole={destination ? 'button' : undefined}
      accessibilityLabel={(read ? '' : 'Não lida. ') + title + '. ' + content}
      disabled={!destination}
      onPress={() => destination && router.push(destination as never)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        minHeight: 96,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
        backgroundColor: pressed ? colors.elevated : read ? 'transparent' : colors.surface,
      })}
    >
      <View style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
        {item.actor ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={'Abrir perfil de ' + item.actor.username}
            disabled={!actorDestination}
            style={{ minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' }}
            onPress={(event) => {
              event.stopPropagation();
              if (actorDestination) router.push(actorDestination as never);
            }}
          >
            <Avatar
              name={item.actor.username}
              uri={item.actor.avatar_url}
              profileStyle={item.actor.avatar_config?.profileStyle}
              size={44}
            />
          </Pressable>
        ) : (
          <TypeIcon size={27} strokeWidth={1.8} color={read ? colors.muted : colors.primary} />
        )}
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
        <Text
          style={{
            color: colors.text,
            fontSize: 15,
            lineHeight: 22,
            fontWeight: read ? '600' : '700',
          }}
        >
          {title}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 21 }}>{content}</Text>
        {!!timestamp(item.created_at ?? item.createdAt) && (
          <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>
            {timestamp(item.created_at ?? item.createdAt)}
          </Text>
        )}
      </View>
      {!read && (
        <View
          style={{
            width: 8,
            height: 8,
            marginTop: 7,
            borderRadius: 4,
            backgroundColor: colors.primary,
          }}
        />
      )}
    </Pressable>
  );
}

export default function Notifications({ fromTab = false }: { fromTab?: boolean } = {}) {
  return (
    <Screen title="Notificações" back={!fromTab} scroll={false}>
      <RemoteList<NotificationEntry>
        path="/api/notifications?useCursor=true&limit=20"
        edgeToEdge
        header={
          <View style={{ padding: 20, paddingBottom: 12 }}>
            <Action secondary label="Marcar todas como lidas" path="/api/notifications" />
          </View>
        }
        empty={
          <Notice
            title="Você está em dia"
            description="Respostas, menções e novidades da sua comunidade aparecerão aqui."
          />
        }
        render={(notification) => <NotificationRow item={notification} />}
      />
    </Screen>
  );
}
