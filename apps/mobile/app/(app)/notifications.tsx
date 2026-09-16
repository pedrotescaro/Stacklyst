import { router } from 'expo-router';
import { Screen, RowLink } from '~/components/ui';
import { Action, RemoteList } from '~/components/remote';
import { Notification } from '~/lib/types';
import { notificationRoute } from '~/lib/links';
export default function Notifications() {
  return (
    <Screen title="Notificações" back scroll={false}>
      <RemoteList<Notification>
        path="/api/notifications?useCursor=true&limit=20"
        header={<Action secondary label="Marcar todas como lidas" path="/api/notifications" />}
        render={(n) => (
          <RowLink
            title={(n.read ? '' : '• ') + n.title}
            subtitle={n.content}
            onPress={() => router.push(notificationRoute(n.link) as never)}
          />
        )}
      />
    </Screen>
  );
}
