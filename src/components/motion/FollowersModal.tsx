'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { X, Users } from 'lucide-react';
import { modalContentVariants, fadeVariants } from '@/lib/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { FollowButton } from './FollowButton';
import { isKlipyMediaUrl } from '@/lib/klipy';
import Link from 'next/link';

interface UserListItem {
  id: string;
  username: string;
  avatar_url?: string | null;
  total_xp: number;
  isFollowing: boolean;
}

interface FollowersModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  currentUserId: string;
  type: 'followers' | 'following';
  title: string;
}

export function FollowersModal({
  open,
  onClose,
  userId,
  currentUserId,
  type,
  title,
}: FollowersModalProps) {
  const reduced = useReducedMotion();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/${userId}/${type}`);
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (err) {
        console.error('Error fetching users list:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [open, userId, type]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const handleToggleUserFollow = async (targetUserId: string) => {
    // Atualização otimista
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === targetUserId) {
          return { ...u, isFollowing: !u.isFollowing };
        }
        return u;
      })
    );

    try {
      const res = await fetch(`/api/users/${targetUserId}/follow`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setUsers((prev) =>
          prev.map((u) => {
            if (u.id === targetUserId) {
              return { ...u, isFollowing: data.following };
            }
            return u;
          })
        );
      } else {
        throw new Error('Erro na requisição');
      }
    } catch (err) {
      console.error(err);
      // Reverter
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === targetUserId) {
            return { ...u, isFollowing: !u.isFollowing };
          }
          return u;
        })
      );
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur */}
          <motion.div
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 backdrop-blur-[8px]"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            variants={reduced ? fadeVariants : modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-md bg-dd-surface border border-dd-border rounded-2xl shadow-2xl z-10 font-sans flex flex-col max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-dd-border">
              <h2 className="text-dd-text text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                {title}
              </h2>
              <button
                onClick={onClose}
                type="button"
                className="dd-focus-ring dd-touch text-dd-text hover:bg-dd-border/50 p-1.5 rounded-full transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List Content */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {loading ? (
                // Loading Shimmers
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-dd-border/50" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-dd-border/50 rounded w-1/3" />
                      <div className="h-2.5 bg-dd-border/50 rounded w-1/4" />
                    </div>
                  </div>
                ))
              ) : users.length === 0 ? (
                // Empty State with dev-voice
                <div className="text-center py-8 px-4 border border-dashed border-dd-border rounded-xl bg-dd-surface/5">
                  <p className="text-xs text-dd-muted italic">
                    {type === 'followers'
                      ? 'Nenhum seguidor ainda. Compartilhe seus códigos e responda perguntas para ser notado!'
                      : 'Você não segue ninguém ainda. Hora de quebrar o gelo e explorar o feed!'}
                  </p>
                </div>
              ) : (
                // Users list
                <div className="divide-y divide-dd-border/30">
                  {users.map((itemUser) => {
                    const initials = itemUser.username.slice(0, 2).toUpperCase();
                    return (
                      <div
                        key={itemUser.id}
                        className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <Link
                          href={`/profile/${itemUser.username}`}
                          onClick={onClose}
                          className="flex items-center gap-3 hover:opacity-85 transition-opacity min-w-0"
                        >
                          {itemUser.avatar_url ? (
                            <Image
                              src={itemUser.avatar_url}
                              alt={itemUser.username}
                              width={40}
                              height={40}
                              unoptimized={isKlipyMediaUrl(itemUser.avatar_url)}
                              className="w-10 h-10 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center text-sm font-bold shrink-0">
                              {initials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-dd-text truncate hover:underline">
                              @{itemUser.username}
                            </p>
                            <p className="text-[10px] text-blue-400 font-mono">
                              {itemUser.total_xp.toLocaleString('pt-BR')} XP
                            </p>
                          </div>
                        </Link>
                        {itemUser.id !== currentUserId && (
                          <div className="shrink-0">
                            <FollowButton
                              isFollowing={itemUser.isFollowing}
                              onToggle={() => handleToggleUserFollow(itemUser.id)}
                              size="sm"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
