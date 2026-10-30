'use client';

import { useId, useRef, useState } from 'react';
import Link from 'next/link';
import { Menu } from '@base-ui/react/menu';
import { Dialog } from '@base-ui/react/dialog';
import { Ban, MessageCircle, MoreHorizontal, Swords } from 'lucide-react';
import { BlockUserButton } from '@/components/BlockUserButton';
import { FollowButton } from '@/components/motion/FollowButton';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import styles from './ProfileActions.module.css';

export function ProfileActions({
  userId,
  username,
  following,
  onFollowToggle,
  onChallenge,
}: {
  userId: string;
  username: string;
  following: boolean;
  onFollowToggle: () => Promise<void>;
  onChallenge?: () => void;
}) {
  const { text } = useLocalizedText();
  const [confirmBlock, setConfirmBlock] = useState(false);
  const moreButton = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  return (
    <div
      className={styles.actions}
      role="group"
      aria-label={text('Ações do perfil', 'Profile actions')}
    >
      <Menu.Root>
        <Menu.Trigger
          ref={moreButton}
          className={styles.iconButton}
          aria-label={text('Mais opções do perfil', 'More profile options')}
          title={text('Mais opções', 'More options')}
        >
          <MoreHorizontal size={21} aria-hidden="true" />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner
            className={styles.positioner}
            sideOffset={8}
            align="end"
            collisionPadding={12}
          >
            <Menu.Popup
              className={styles.menu}
              aria-label={text('Opções do perfil', 'Profile options')}
            >
              {onChallenge && (
                <Menu.Item className={styles.menuItem} onClick={onChallenge}>
                  <Swords size={18} aria-hidden="true" />
                  {text('Desafiar', 'Challenge')}
                </Menu.Item>
              )}
              <Menu.Item
                className={`${styles.menuItem} ${styles.destructive}`}
                onClick={() => setConfirmBlock(true)}
              >
                <Ban size={18} aria-hidden="true" />
                {text(`Bloquear @${username}`, `Block @${username}`)}
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
      <Link
        className={styles.iconButton}
        href={`/messages?to=${encodeURIComponent(username)}`}
        aria-label={text(`Enviar mensagem para @${username}`, `Message @${username}`)}
        title={text('Enviar mensagem', 'Send message')}
      >
        <MessageCircle size={21} aria-hidden="true" />
      </Link>
      <FollowButton
        isFollowing={following}
        onToggle={onFollowToggle}
        appearance="profile"
        className={styles.followButton}
      />
      <Dialog.Root open={confirmBlock} onOpenChange={setConfirmBlock}>
        <Dialog.Portal>
          <Dialog.Backdrop className={styles.backdrop} />
          <Dialog.Popup
            className={styles.confirmation}
            aria-labelledby={titleId}
            finalFocus={moreButton}
          >
            {confirmBlock && (
              <BlockUserButton
                userId={userId}
                username={username}
                initialConfirming
                confirmationTitleId={titleId}
                onCancel={() => setConfirmBlock(false)}
                onChanged={() => setConfirmBlock(false)}
              />
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
