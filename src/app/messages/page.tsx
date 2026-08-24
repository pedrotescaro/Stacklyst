'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { EMOJI_CATEGORIES, insertAtCursor } from '@/lib/post-composer';
import { Sidebar } from '@/components/Sidebar';
import { EmptyState } from '@/components/motion/EmptyState';
import { TypingIndicator } from '@/components/motion/TypingIndicator';
import {
  Search,
  Settings,
  Send,
  Plus,
  X,
  Smile,
  Image as ImageIcon,
  MoreHorizontal,
  Reply,
  Share2,
  Pencil,
  Copy,
  Info,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { getCurrentUser } from '@/lib/client/current-user';

function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  onClose: () => void,
  active: boolean
) {
  useEffect(() => {
    if (!active) return;

    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [active, onClose, ref]);
}

const QUICK_REACTION_EMOJIS = ['❤️', '👍', '😂', '🔥', '🎉', '💡', '🚀', '👀'];

export interface MessageReactionItem {
  id?: string;
  message_id?: string;
  user_id: string;
  emoji: string;
  user?: {
    id: string;
    username: string;
  };
}

interface ChatItem {
  partnerId: string;
  lastMessage: string;
  lastMessageTime: string;
  lastSenderId: string;
  partner: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  image_url?: string | null;
  is_edited?: boolean;
  updated_at?: string | null;
  reactions?: MessageReactionItem[];
}

interface UserListItem {
  id: string;
  username: string;
  avatar_url: string | null;
}

export default function MessagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  // Conversations & Messages states
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [activeChat, setActiveChat] = useState<ChatItem | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [messageImage, setMessageImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showTypingPreview, setShowTypingPreview] = useState(false);

  // Search/Filter states
  const [chatSearchQuery, setChatSearchQuery] = useState('');

  // New conversation modal states
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<UserListItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersSearchQuery, setUsersSearchQuery] = useState('');
  const [emojiPanelOpen, setEmojiPanelOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Edit / Delete states
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [activeMenuMessageId, setActiveMenuMessageId] = useState<string | null>(null);
  const [activeReactionMessageId, setActiveReactionMessageId] = useState<string | null>(null);
  const [activeReactionPickerMessageId, setActiveReactionPickerMessageId] = useState<string | null>(
    null
  );
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null);
  const [infoMessage, setInfoMessage] = useState<Message | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messageInputRef = useRef<HTMLInputElement | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const messageMenuRef = useRef<HTMLDivElement | null>(null);
  const reactionBarRef = useRef<HTMLDivElement | null>(null);
  const reactionPickerRef = useRef<HTMLDivElement | null>(null);

  useClickOutside(emojiPickerRef, () => setEmojiPanelOpen(false), emojiPanelOpen);
  useClickOutside(messageMenuRef, () => setActiveMenuMessageId(null), activeMenuMessageId !== null);
  useClickOutside(
    reactionBarRef,
    () => setActiveReactionMessageId(null),
    activeReactionMessageId !== null
  );
  useClickOutside(
    reactionPickerRef,
    () => setActiveReactionPickerMessageId(null),
    activeReactionPickerMessageId !== null
  );

  useEffect(() => {
    const updateSoundState = () => {
      setSoundEnabled(localStorage.getItem('stacklyst-sound') !== 'false');
    };

    updateSoundState();

    window.addEventListener('storage', updateSoundState);
    window.addEventListener('stacklyst-sound-changed', updateSoundState);

    return () => {
      window.removeEventListener('storage', updateSoundState);
      window.removeEventListener('stacklyst-sound-changed', updateSoundState);
    };
  }, []);

  const { playSound } = useSoundEffects(soundEnabled);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const fetchPageData = async () => {
      try {
        const [userData, resChats] = await Promise.all([
          getCurrentUser<any>(),
          fetch('/api/messages/chats', { signal: controller.signal }),
        ]);

        if (!userData) {
          router.replace('/login');
          return;
        }

        const chatData = resChats.ok ? await resChats.json() : [];

        if (!active) return;
        setUser(userData);
        setChats(chatData);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        console.error('Error fetching messages page data:', err);
      } finally {
        if (active) setLoadingChats(false);
      }
    };

    fetchPageData();

    return () => {
      active = false;
      controller.abort();
    };
  }, [router]);

  // Fetch message history for active chat
  useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await fetch(`/api/messages?receiver_id=${activeChat.partnerId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error('Error fetching message history:', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeChat]);

  useEffect(() => {
    if (!activeChat) return;
    setShowTypingPreview(true);
    const timer = setTimeout(() => setShowTypingPreview(false), 1200);
    return () => clearTimeout(timer);
  }, [activeChat]);

  // Scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingMessages]);

  // Setup Supabase Realtime for instant messaging, editing, and deletion
  useEffect(() => {
    if (!user) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`chat-room:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Message',
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          // Only append if it's from the active chat partner
          if (activeChat && newMsg.sender_id === activeChat.partnerId) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
            playSound('notification');
          }

          // Refetch active chats to update list/order
          const resChats = await fetch('/api/messages/chats');
          if (resChats.ok) {
            const data = await resChats.json();
            setChats(data);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'Message',
        },
        (payload) => {
          const updatedMsg = payload.new as Message;
          if (
            activeChat &&
            ((updatedMsg.sender_id === user.id &&
              updatedMsg.receiver_id === activeChat.partnerId) ||
              (updatedMsg.sender_id === activeChat.partnerId && updatedMsg.receiver_id === user.id))
          ) {
            setMessages((prev) => prev.map((msg) => (msg.id === updatedMsg.id ? updatedMsg : msg)));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'Message',
        },
        (payload) => {
          const deletedId = (payload.old as any).id;
          setMessages((prev) => prev.filter((msg) => msg.id !== deletedId));
        }
      )
      .on('broadcast', { event: 'message_reaction' }, (event) => {
        const { messageId, emoji, userId, username } = event.payload || {};
        if (!messageId || !emoji || !userId) return;

        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id !== messageId) return msg;

            const currentReactions = msg.reactions || [];
            const hasReactedWithThis = currentReactions.some(
              (r) => r.user_id === userId && r.emoji === emoji
            );

            let newReactions: MessageReactionItem[];
            if (hasReactedWithThis) {
              newReactions = currentReactions.filter(
                (r) => !(r.user_id === userId && r.emoji === emoji)
              );
            } else {
              newReactions = [
                ...currentReactions,
                {
                  id: `rt-${Date.now()}`,
                  message_id: messageId,
                  user_id: userId,
                  emoji,
                  user: { id: userId, username: username || '' },
                },
              ];
            }

            return { ...msg, reactions: newReactions };
          })
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeChat, playSound]);

  const handleReactToMessage = async (msgId: string, emoji: string) => {
    if (!user) return;

    playSound('bookmark');
    setActiveReactionMessageId(null);
    setActiveReactionPickerMessageId(null);

    // Optimistic UI update
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== msgId) return msg;

        const currentReactions = msg.reactions || [];
        const hasReactedWithThis = currentReactions.some(
          (r) => r.user_id === user.id && r.emoji === emoji
        );

        let newReactions: MessageReactionItem[];
        if (hasReactedWithThis) {
          newReactions = currentReactions.filter(
            (r) => !(r.user_id === user.id && r.emoji === emoji)
          );
        } else {
          newReactions = [
            ...currentReactions,
            {
              id: `temp-${Date.now()}`,
              message_id: msgId,
              user_id: user.id,
              emoji,
              user: { id: user.id, username: user.username },
            },
          ];
        }

        return { ...msg, reactions: newReactions };
      })
    );

    // Broadcast to chat partner
    if (activeChat) {
      try {
        const supabase = createClient();
        const partnerChannel = supabase.channel(`chat-room:${activeChat.partnerId}`);
        await partnerChannel.send({
          type: 'broadcast',
          event: 'message_reaction',
          payload: {
            messageId: msgId,
            emoji,
            userId: user.id,
            username: user.username,
          },
        });
      } catch {
        // Broadcast is best effort
      }
    }

    try {
      const res = await fetch(`/api/messages/${msgId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Failed to react to message:', res.status, errorData);
      }
    } catch (err) {
      console.error('Error reacting to message:', err);
    }
  };

  const handleEditMessage = async (msgId: string, newContent: string) => {
    if (!newContent.trim()) return;

    // Optimistic UI update
    setMessages((prev) =>
      prev.map((msg) => (msg.id === msgId ? { ...msg, content: newContent, is_edited: true } : msg))
    );
    setEditingMessage(null);

    try {
      const res = await fetch(`/api/messages/${msgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      });

      if (!res.ok) {
        console.error('Failed to edit message');
      }
    } catch (err) {
      console.error('Error editing message:', err);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    // Optimistic UI update
    setMessages((prev) => prev.filter((msg) => msg.id !== msgId));
    setDeletingMessageId(null);

    try {
      const res = await fetch(`/api/messages/${msgId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        console.error('Failed to delete message');
      }
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  const handleForwardMessage = async (receiverId: string) => {
    if (!forwardingMessage) return;
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver_id: receiverId,
          content: forwardingMessage.content,
          image_url: forwardingMessage.image_url,
        }),
      });
      if (res.ok) {
        setToastMessage('Mensagem encaminhada!');
        setTimeout(() => setToastMessage(null), 2500);

        // Refetch active chats to update list/order
        const resChats = await fetch('/api/messages/chats');
        if (resChats.ok) {
          const data = await resChats.json();
          setChats(data);
        }
      }
    } catch (err) {
      console.error('Failed to forward message:', err);
    } finally {
      setForwardingMessage(null);
    }
  };

  const handleToggleMenu = (e: React.MouseEvent, msgId: string) => {
    e.stopPropagation();
    if (activeMenuMessageId === msgId) {
      setActiveMenuMessageId(null);
    } else {
      setActiveMenuMessageId(msgId);
    }
  };

  const insertEmoji = (emoji: string) => {
    if (messageInputRef.current) {
      insertAtCursor(messageInputRef.current, emoji, newMessageText, setNewMessageText);
      setEmojiPanelOpen(false);
      messageInputRef.current.focus();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setMessageImage(data.url);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChat || (!newMessageText.trim() && !messageImage) || !user || uploadingImage) return;

    let textToSend = newMessageText.trim();
    if (replyingToMessage) {
      textToSend =
        `⤷ Em resposta a @${replyingToMessage.sender_id === user.id ? 'você' : activeChat.partner.username}: "${replyingToMessage.content}"\n\n` +
        textToSend;
      setReplyingToMessage(null);
    }
    const imageToSend = messageImage;
    setNewMessageText('');
    setMessageImage('');

    // Optimistic UI update
    const tempMessage: Message = {
      id: Math.random().toString(),
      sender_id: user.id,
      receiver_id: activeChat.partnerId,
      content: textToSend,
      image_url: imageToSend,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);
    playSound('send_dm');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver_id: activeChat.partnerId,
          content: textToSend,
          image_url: imageToSend,
        }),
      });

      if (res.ok) {
        // Refetch active chats to update list/order
        const resChats = await fetch('/api/messages/chats');
        if (resChats.ok) {
          const data = await resChats.json();
          setChats(data);
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleOpenNewChatModal = async () => {
    setNewChatModalOpen(true);
    setLoadingUsers(true);
    try {
      // Find all users in the system to choose from
      const res = await fetch('/api/users/search?q=');
      if (res.ok) {
        const data = await res.json();
        // filter out current user
        setAllUsers(data.filter((u: any) => u.id !== user?.id));
      }
    } catch (err) {
      console.error('Failed to fetch users list:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSearchUsers = async (query: string) => {
    setUsersSearchQuery(query);
    setLoadingUsers(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data.filter((u: any) => u.id !== user?.id));
      }
    } catch (err) {
      console.error('Failed to search users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleStartConversation = (targetUser: UserListItem) => {
    setNewChatModalOpen(false);
    setUsersSearchQuery('');

    // Check if chat already exists in list
    const existingChat = chats.find((c) => c.partnerId === targetUser.id);
    if (existingChat) {
      setActiveChat(existingChat);
    } else {
      // Create a temporary ChatItem structure to mount
      const tempChat: ChatItem = {
        partnerId: targetUser.id,
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        lastSenderId: user?.id || '',
        partner: {
          id: targetUser.id,
          username: targetUser.username,
          avatar_url: targetUser.avatar_url,
        },
      };
      setChats((prev) => [tempChat, ...prev]);
      setActiveChat(tempChat);
    }
  };

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const hrs = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    return `${hrs}:${mins}`;
  };

  const formatChatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / 3600000;

    if (diffHours < 24) {
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays}d`;
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  // Filter local chats sidebar by search input
  const filteredChats = chats.filter(
    (c) =>
      c.partner.username.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(chatSearchQuery.toLowerCase())
  );

  return (
    <div className="dd-platform-shell h-screen overflow-hidden">
      <Sidebar user={user} />

      <div className="flex h-full min-w-0 flex-1 flex-grow overflow-hidden bg-dd-bg w-full">
        <div className="flex w-full h-full overflow-hidden">
          {/* Left Panel: Conversation List Sidebar */}
          <div
            className={cn(
              'w-full md:w-80 lg:w-96 border-r border-dd-border/60 flex flex-col shrink-0 h-full overflow-hidden bg-dd-bg',
              activeChat ? 'hidden md:flex' : 'flex'
            )}
          >
            {/* Header */}
            <div className="p-4 pb-2 flex items-center justify-between shrink-0">
              <h1 className="text-lg font-black tracking-tight text-dd-text">Bate-papo</h1>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-dd-surface/60 rounded-full text-dd-text transition-colors">
                  <Settings className="w-4.5 h-4.5" />
                </button>
                <button
                  onClick={handleOpenNewChatModal}
                  className="p-2 hover:bg-dd-surface/60 rounded-full text-dd-text transition-colors"
                  title="Novo Chat"
                >
                  <Plus className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Local Search Input */}
            <div className="p-4 pt-1 shrink-0">
              <div className="relative">
                <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dd-muted" />
                <input
                  type="text"
                  placeholder="Buscar conversas"
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  className="w-full rounded-full bg-dd-surface/80 border border-transparent focus:border-blue-500/50 focus:bg-dd-bg py-2 pl-11 pr-4 text-xs font-semibold text-dd-text placeholder-dd-muted/70 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Conversation Partners Scroll */}
            <div className="flex-grow overflow-y-auto divide-y divide-dd-border/40">
              {loadingChats ? (
                <div className="flex flex-col items-center py-10 gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  <p className="text-[10px] text-dd-muted">Buscando chats...</p>
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <p className="text-xs text-dd-muted font-bold">Nenhum bate-papo iniciado</p>
                  <button
                    onClick={handleOpenNewChatModal}
                    className="text-xs text-blue-400 font-extrabold hover:underline"
                  >
                    Iniciar nova conversa
                  </button>
                </div>
              ) : (
                filteredChats.map((chat) => {
                  const isActive = activeChat?.partnerId === chat.partnerId;
                  const initials = chat.partner.username.slice(0, 2).toUpperCase();

                  return (
                    <button
                      key={chat.partnerId}
                      onClick={() => setActiveChat(chat)}
                      className={`w-full p-4 flex gap-3 text-left transition-colors duration-150 relative ${
                        isActive
                          ? 'bg-dd-surface/40 border-r-2 border-blue-500'
                          : 'hover:bg-dd-surface/20'
                      }`}
                    >
                      {/* Avatar */}
                      {chat.partner.avatar_url ? (
                        <Image
                          src={chat.partner.avatar_url}
                          alt={chat.partner.username}
                          width={44}
                          height={44}
                          className="w-11 h-11 rounded-full object-cover border border-dd-border shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-500/10 shrink-0">
                          {initials}
                        </div>
                      )}

                      {/* Content Info */}
                      <div className="flex-grow min-w-0 space-y-1">
                        <div className="flex justify-between items-baseline gap-2">
                          <p className="text-xs font-extrabold text-dd-text truncate">
                            {chat.partner.username}
                          </p>
                          <span className="text-[9.5px] text-dd-muted shrink-0 font-medium">
                            {formatChatTime(chat.lastMessageTime)}
                          </span>
                        </div>
                        <p className="text-xs text-dd-muted truncate leading-relaxed">
                          {chat.lastSenderId === user?.id && (
                            <span className="text-blue-400/80 mr-0.5">Você:</span>
                          )}
                          {chat.lastMessage || 'Nenhuma mensagem enviada.'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Chat Active Viewport OR Empty State */}
          <div
            className={cn(
              'flex-1 flex-col bg-dd-bg h-full overflow-hidden min-w-0',
              activeChat ? 'flex' : 'hidden md:flex'
            )}
          >
            {activeChat ? (
              // Active Conversation Screen
              <>
                {/* Active Header */}
                <div className="p-3 sm:p-4 border-b border-dd-border/60 bg-dd-bg flex items-center gap-3 shrink-0">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => setActiveChat(null)}
                    className="md:hidden p-2 -ml-1 hover:bg-dd-surface rounded-full text-dd-text transition-colors cursor-pointer"
                    title="Voltar para conversas"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {activeChat.partner.avatar_url ? (
                    <Image
                      src={activeChat.partner.avatar_url}
                      alt={activeChat.partner.username}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover border border-dd-border"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-500/10">
                      {activeChat.partner.username.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xs font-black text-dd-text">
                      @{activeChat.partner.username}
                    </h3>
                    <p className="text-[9.5px] text-dd-muted font-bold tracking-wide mt-0.5">
                      Ativo recentemente
                    </p>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-dd-surface/10">
                  {loadingMessages ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-dd-muted">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                      <p className="text-[10px]">Buscando mensagens...</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg, index) => {
                        const isCurrentUser = msg.sender_id === user?.id;

                        // Parse reply prefix if any
                        const replyPrefix = '⤷ Em resposta a @';
                        let replyUser = '';
                        let replyText = '';
                        let displayContent = msg.content;

                        if (msg.content && msg.content.startsWith(replyPrefix)) {
                          const firstLineEnd = msg.content.indexOf('\n\n');
                          if (firstLineEnd !== -1) {
                            const replyLine = msg.content.substring(0, firstLineEnd);
                            displayContent = msg.content.substring(firstLineEnd + 2);

                            const match = replyLine.match(/⤷ Em resposta a @([^:]+): "([\s\S]+)"/);
                            if (match) {
                              replyUser = match[1];
                              replyText = match[2];
                            }
                          }
                        }

                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, x: isCurrentUser ? 12 : -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: index * 0.03,
                              duration: 0.2,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            className={`flex flex-col max-w-[85%] sm:max-w-[75%] lg:max-w-[65%] xl:max-w-[55%] space-y-1 group relative ${
                              isCurrentUser ? 'ml-auto items-end' : 'mr-auto items-start'
                            }`}
                          >
                            <div
                              className={`flex items-center gap-2 max-w-full relative ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                              <div
                                className={`rounded-2xl px-4 py-2 text-xs leading-relaxed font-semibold shadow-sm max-w-full ${
                                  isCurrentUser
                                    ? 'bg-blue-500 text-white rounded-br-none'
                                    : 'bg-dd-surface text-dd-text rounded-bl-none border border-dd-border/60'
                                }`}
                              >
                                {msg.image_url && (
                                  <Image
                                    src={msg.image_url}
                                    alt="Anexo"
                                    width={320}
                                    height={192}
                                    className={`rounded-xl object-cover max-h-48 max-w-full ${msg.content ? 'mb-2' : ''}`}
                                  />
                                )}
                                {replyText && (
                                  <div className="bg-black/10 dark:bg-white/10 rounded-lg p-2 mb-1.5 border-l-2 border-blue-500/80 text-[10px] opacity-80 max-w-full truncate">
                                    <span className="font-extrabold text-blue-400 block mb-0.5">
                                      Em resposta a @{replyUser}
                                    </span>
                                    <span className="line-clamp-2">{replyText}</span>
                                  </div>
                                )}
                                {displayContent && (
                                  <p className="break-words whitespace-pre-wrap">
                                    {displayContent}
                                  </p>
                                )}
                              </div>

                              <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center gap-1 shrink-0 relative">
                                {/* Reaction Button with Quick Emojis & Full Emoji Picker */}
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveReactionMessageId((prev) =>
                                        prev === msg.id ? null : msg.id
                                      );
                                      setActiveReactionPickerMessageId(null);
                                      setActiveMenuMessageId(null);
                                    }}
                                    className={`p-1.5 hover:bg-dd-surface/85 text-dd-muted hover:text-yellow-400 rounded-full transition-colors cursor-pointer ${
                                      activeReactionMessageId === msg.id ||
                                      activeReactionPickerMessageId === msg.id
                                        ? 'bg-dd-surface/85 text-yellow-400'
                                        : ''
                                    }`}
                                    title="Reagir com emoji"
                                  >
                                    <Smile className="w-3.5 h-3.5" />
                                  </button>

                                  <AnimatePresence>
                                    {activeReactionMessageId === msg.id && (
                                      <motion.div
                                        ref={reactionBarRef}
                                        initial={{ opacity: 0, scale: 0.9, y: index <= 3 ? -6 : 6 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: index <= 3 ? -6 : 6 }}
                                        transition={{ duration: 0.12 }}
                                        className={`absolute z-[100] bg-dd-surface/95 backdrop-blur-md border border-dd-border/80 rounded-full shadow-2xl p-1 flex items-center gap-0.5 ${
                                          index <= 3 ? 'top-0 mt-7' : 'bottom-0 mb-7'
                                        } ${isCurrentUser ? 'right-0' : 'left-0'}`}
                                      >
                                        {QUICK_REACTION_EMOJIS.map((emoji) => (
                                          <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => handleReactToMessage(msg.id, emoji)}
                                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 hover:scale-125 transition-all text-sm cursor-pointer"
                                          >
                                            {emoji}
                                          </button>
                                        ))}

                                        <div className="w-[1px] h-4 bg-dd-border/60 mx-0.5" />

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveReactionPickerMessageId(msg.id);
                                            setActiveReactionMessageId(null);
                                          }}
                                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-dd-muted hover:text-dd-text transition-colors cursor-pointer text-xs font-bold"
                                          title="Mais emojis..."
                                        >
                                          <Plus className="w-3.5 h-3.5" />
                                        </button>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>

                                  {/* Full Emoji Picker Popover */}
                                  <AnimatePresence>
                                    {activeReactionPickerMessageId === msg.id && (
                                      <motion.div
                                        ref={reactionPickerRef}
                                        initial={{
                                          opacity: 0,
                                          scale: 0.95,
                                          y: index <= 3 ? -10 : 10,
                                        }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: index <= 3 ? -10 : 10 }}
                                        transition={{ duration: 0.15 }}
                                        className={`absolute z-[110] w-64 bg-dd-surface/95 backdrop-blur-md border border-dd-border/80 rounded-2xl shadow-2xl p-2.5 ${
                                          index <= 3 ? 'top-0 mt-8' : 'bottom-0 mb-8'
                                        } ${isCurrentUser ? 'right-0' : 'left-0'}`}
                                      >
                                        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-dd-border/40">
                                          <span className="text-[11px] font-bold text-dd-muted uppercase tracking-wider">
                                            Reagir com emoji
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => setActiveReactionPickerMessageId(null)}
                                            className="text-dd-muted hover:text-dd-text p-0.5 rounded cursor-pointer"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                                          {EMOJI_CATEGORIES.map((cat) => (
                                            <div key={cat.name}>
                                              <span className="text-[10px] font-semibold text-dd-muted/80 block mb-1">
                                                {cat.name}
                                              </span>
                                              <div className="grid grid-cols-6 gap-1">
                                                {cat.emojis.map((emoji) => (
                                                  <button
                                                    key={emoji}
                                                    type="button"
                                                    onClick={() =>
                                                      handleReactToMessage(msg.id, emoji)
                                                    }
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 hover:scale-115 transition-all text-sm cursor-pointer"
                                                  >
                                                    {emoji}
                                                  </button>
                                                ))}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>

                                <button
                                  type="button"
                                  onClick={(e) => handleToggleMenu(e, msg.id)}
                                  className={`p-1.5 hover:bg-dd-surface/85 text-dd-muted hover:text-dd-text rounded-full transition-colors cursor-pointer ${
                                    activeMenuMessageId === msg.id
                                      ? 'bg-dd-surface/85 text-dd-text'
                                      : ''
                                  }`}
                                  title="Mais opções"
                                >
                                  <MoreHorizontal className="w-3.5 h-3.5" />
                                </button>

                                <AnimatePresence>
                                  {activeMenuMessageId === msg.id && (
                                    <motion.div
                                      ref={messageMenuRef}
                                      initial={{
                                        opacity: 0,
                                        scale: 0.95,
                                        y: index <= 3 ? -10 : 10,
                                      }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: index <= 3 ? -10 : 10 }}
                                      transition={{ duration: 0.15, ease: 'easeOut' }}
                                      className={`absolute z-[90] min-w-[230px] bg-dd-surface/95 backdrop-blur-md border border-dd-border/80 rounded-2xl shadow-2xl p-1 flex flex-col gap-0.5 font-sans text-xs ${
                                        index <= 3 ? 'top-0 mt-6' : 'bottom-0 mb-6'
                                      } ${isCurrentUser ? 'right-0' : 'left-0'}`}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setReplyingToMessage(msg);
                                          setActiveMenuMessageId(null);
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-dd-text hover:bg-dd-surface-hover/80 transition-colors text-left font-semibold cursor-pointer"
                                      >
                                        <Reply className="w-3.5 h-3.5 text-dd-muted" />
                                        <span>Responder</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setForwardingMessage(msg);
                                          setActiveMenuMessageId(null);
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-dd-text hover:bg-dd-surface-hover/80 transition-colors text-left font-semibold cursor-pointer"
                                      >
                                        <Share2 className="w-3.5 h-3.5 text-dd-muted" />
                                        <span>Encaminhar</span>
                                      </button>
                                      {isCurrentUser && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingMessage(msg);
                                            setEditContent(displayContent);
                                            setActiveMenuMessageId(null);
                                          }}
                                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-dd-text hover:bg-dd-surface-hover/80 transition-colors text-left font-semibold cursor-pointer"
                                        >
                                          <Pencil className="w-3.5 h-3.5 text-dd-muted" />
                                          <span>Editar mensagem</span>
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(displayContent);
                                          setToastMessage('Copiado!');
                                          setTimeout(() => setToastMessage(null), 2000);
                                          setActiveMenuMessageId(null);
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-dd-text hover:bg-dd-surface-hover/80 transition-colors text-left font-semibold cursor-pointer"
                                      >
                                        <Copy className="w-3.5 h-3.5 text-dd-muted" />
                                        <span>Copiar texto de mensagem</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setInfoMessage(msg);
                                          setActiveMenuMessageId(null);
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-dd-text hover:bg-dd-surface-hover/80 transition-colors text-left font-semibold cursor-pointer"
                                      >
                                        <Info className="w-3.5 h-3.5 text-dd-muted" />
                                        <span>Informações</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setMessages((prev) =>
                                            prev.filter((m) => m.id !== msg.id)
                                          );
                                          setToastMessage('Mensagem excluída para você');
                                          setTimeout(() => setToastMessage(null), 2000);
                                          setActiveMenuMessageId(null);
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors text-left font-semibold cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                        <span>Excluir para mim</span>
                                      </button>
                                      {isCurrentUser && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setDeletingMessageId(msg.id);
                                            setActiveMenuMessageId(null);
                                          }}
                                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors text-left font-semibold cursor-pointer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                          <span>Excluir para todos</span>
                                        </button>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>

                            {/* Message Reactions Pills */}
                            {(() => {
                              const groupedReactions = (msg.reactions || []).reduce<
                                Record<
                                  string,
                                  {
                                    emoji: string;
                                    count: number;
                                    userNames: string[];
                                    hasReacted: boolean;
                                  }
                                >
                              >((acc, r) => {
                                if (!acc[r.emoji]) {
                                  acc[r.emoji] = {
                                    emoji: r.emoji,
                                    count: 0,
                                    userNames: [],
                                    hasReacted: false,
                                  };
                                }
                                acc[r.emoji].count += 1;
                                if (r.user?.username) {
                                  acc[r.emoji].userNames.push(
                                    r.user_id === user?.id ? 'Você' : `@${r.user.username}`
                                  );
                                } else if (r.user_id === user?.id) {
                                  acc[r.emoji].userNames.push('Você');
                                }
                                if (r.user_id === user?.id) {
                                  acc[r.emoji].hasReacted = true;
                                }
                                return acc;
                              }, {});

                              const reactionList = Object.values(groupedReactions);
                              if (reactionList.length === 0) return null;

                              return (
                                <div
                                  className={`flex flex-wrap gap-1 mt-0.5 px-1 max-w-full z-10 ${
                                    isCurrentUser ? 'justify-end' : 'justify-start'
                                  }`}
                                >
                                  {reactionList.map((item) => {
                                    const tooltipText =
                                      item.userNames.length > 0
                                        ? item.userNames.join(', ')
                                        : 'Reação';
                                    return (
                                      <button
                                        key={item.emoji}
                                        type="button"
                                        onClick={() => handleReactToMessage(msg.id, item.emoji)}
                                        title={tooltipText}
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all transform active:scale-95 cursor-pointer ${
                                          item.hasReacted
                                            ? 'bg-blue-500/20 border-blue-500/60 text-blue-400 font-semibold shadow-sm'
                                            : 'bg-dd-surface/90 hover:bg-dd-surface border-dd-border/70 text-dd-text'
                                        }`}
                                      >
                                        <span className="text-xs">{item.emoji}</span>
                                        <span className="text-[10px] opacity-90">{item.count}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              );
                            })()}

                            <div className="flex items-center gap-1.5 text-[9px] text-dd-muted px-1.5 font-medium">
                              <span>{formatMessageTime(msg.created_at)}</span>
                              {msg.is_edited && (
                                <span className="italic opacity-80">(editada)</span>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                      {showTypingPreview && (
                        <TypingIndicator username={activeChat.partner.username} />
                      )}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Messages Input Bar */}
                <div className="border-t border-dd-border/60 bg-dd-bg flex flex-col shrink-0">
                  {/* Reply Preview Area */}
                  {replyingToMessage && (
                    <div className="flex items-center justify-between px-4 py-2.5 bg-dd-surface/60 border-b border-dd-border/40 text-xs font-semibold text-dd-muted">
                      <div className="flex items-center gap-1.5 truncate">
                        <Reply className="w-3.5 h-3.5 text-blue-400" />
                        <span>
                          Respondendo a{' '}
                          <strong className="text-dd-text">
                            @
                            {replyingToMessage.sender_id === user?.id
                              ? 'você'
                              : activeChat.partner.username}
                          </strong>
                          : &quot;
                          {replyingToMessage.content.replace(
                            /^⤷ Em resposta a @.+: "[\s\S]+"\n\n/,
                            ''
                          )}
                          &quot;
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReplyingToMessage(null)}
                        className="p-1.5 hover:bg-dd-surface hover:text-dd-text rounded-md transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Image Preview Area */}
                  {messageImage && (
                    <div className="p-3 pb-0">
                      <div className="relative inline-block">
                        <Image
                          src={messageImage}
                          alt="Anexo"
                          width={80}
                          height={80}
                          className="h-20 rounded-xl object-cover border border-dd-border shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setMessageImage('')}
                          className="absolute -top-2 -right-2 p-1 bg-dd-surface border border-dd-border rounded-full text-dd-text hover:text-red-400 transition-colors shadow-md cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="p-4">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="dm-image-upload"
                          disabled={uploadingImage}
                        />
                        <label
                          htmlFor="dm-image-upload"
                          className={`p-2 rounded-full transition-colors shrink-0 cursor-pointer flex items-center justify-center ${
                            uploadingImage
                              ? 'text-blue-500 animate-pulse bg-blue-500/10'
                              : 'text-dd-muted hover:text-dd-text'
                          }`}
                        >
                          <ImageIcon className="w-4.5 h-4.5" />
                        </label>
                      </div>
                      <div className="relative" ref={emojiPickerRef}>
                        <button
                          type="button"
                          onClick={() => setEmojiPanelOpen(!emojiPanelOpen)}
                          className={`p-2 rounded-full transition-colors shrink-0 ${
                            emojiPanelOpen
                              ? 'bg-blue-500/15 text-blue-400'
                              : 'text-dd-muted hover:text-dd-text'
                          }`}
                        >
                          <Smile className="w-4.5 h-4.5" />
                        </button>
                        <AnimatePresence>
                          {emojiPanelOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              transition={{ duration: 0.2 }}
                              className="absolute left-0 bottom-full mb-2 z-[100] w-72 rounded-xl border border-dd-border/80 bg-dd-surface/95 backdrop-blur-md p-3 shadow-2xl"
                            >
                              <p className="text-[10px] font-bold uppercase tracking-wider text-dd-muted mb-2">
                                Emojis
                              </p>
                              <div className="space-y-3 max-h-52 overflow-y-auto">
                                {EMOJI_CATEGORIES.map((category) => (
                                  <div key={category.name}>
                                    <p className="text-[10px] font-bold text-blue-400 mb-1.5">
                                      {category.name}
                                    </p>
                                    <div className="grid grid-cols-6 gap-1">
                                      {category.emojis.map((emoji) => (
                                        <button
                                          key={`${category.name}-${emoji}`}
                                          type="button"
                                          onClick={() => insertEmoji(emoji)}
                                          className="text-lg rounded-lg p-1.5 hover:bg-blue-500/10 transition-colors cursor-pointer"
                                        >
                                          {emoji}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <input
                        ref={messageInputRef}
                        type="text"
                        placeholder="Enviar uma mensagem..."
                        value={newMessageText}
                        onChange={(e) => setNewMessageText(e.target.value)}
                        className="flex-1 rounded-full bg-dd-surface/80 border border-transparent focus:border-blue-500/50 focus:bg-dd-bg py-2.5 px-4 text-xs font-semibold text-dd-text placeholder-dd-muted/65 focus:outline-none transition-colors"
                      />

                      <button
                        type="submit"
                        disabled={(!newMessageText.trim() && !messageImage) || uploadingImage}
                        className="p-2.5 bg-blue-500 text-white rounded-full transition-all shrink-0 hover:bg-blue-600 disabled:opacity-50 disabled:bg-dd-surface disabled:text-dd-muted active:scale-95 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              </>
            ) : (
              // Empty State Screen (Matching image 4)
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-5 bg-dd-bg">
                <EmptyState type="dm" />
                <button
                  onClick={handleOpenNewChatModal}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-black py-2.5 px-6 rounded-full transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Novo chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Chat Selection Modal */}
      {newChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setNewChatModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-dd-surface border border-dd-border rounded-2xl shadow-2xl overflow-hidden z-10 animate-scale-up font-sans flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-dd-border">
              <h3 className="font-extrabold text-sm text-dd-text">Iniciar conversa</h3>
              <button
                onClick={() => setNewChatModalOpen(false)}
                className="p-1 text-dd-muted hover:text-dd-text rounded-md transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Search bar inside modal */}
            <div className="p-4 border-b border-dd-border/50">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dd-muted" />
                <input
                  type="text"
                  placeholder="Pesquisar pessoas"
                  value={usersSearchQuery}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  className="w-full rounded-full bg-dd-bg border border-dd-border py-2 pl-11 pr-4 text-xs font-semibold text-dd-text focus:border-blue-500/50 focus:outline-none"
                />
              </div>
            </div>

            {/* Scrollable list of users */}
            <div className="flex-1 overflow-y-auto divide-y divide-dd-border/30 p-2">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-10 gap-2 text-dd-muted">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  <p className="text-xs">Buscando desenvolvedores...</p>
                </div>
              ) : allUsers.length === 0 ? (
                <div className="text-center py-10 text-xs text-dd-muted font-semibold">
                  Nenhum desenvolvedor encontrado.
                </div>
              ) : (
                allUsers.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleStartConversation(item)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-dd-bg text-left transition-colors"
                  >
                    {item.avatar_url ? (
                      <Image
                        src={item.avatar_url}
                        alt={item.username}
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-full object-cover border border-dd-border"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-500/10">
                        {item.username.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-extrabold text-dd-text">{item.username}</p>
                      <p className="text-[10px] text-dd-muted font-bold">
                        @{item.username.toLowerCase()}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Message Modal */}
      <AnimatePresence>
        {editingMessage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingMessage(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-dd-surface border border-dd-border rounded-2xl p-5 shadow-2xl z-10"
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-modal-title"
            >
              <h3 id="edit-modal-title" className="text-sm font-black text-dd-text mb-3">
                Editar mensagem
              </h3>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-dd-bg border border-dd-border/80 focus:border-blue-500 rounded-xl p-3 text-xs font-semibold text-dd-text outline-none resize-none min-h-[100px]"
                placeholder="Edite sua mensagem..."
                autoFocus
              />
              <div className="flex justify-end gap-2.5 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingMessage(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-dd-muted hover:bg-dd-surface-hover hover:text-dd-text transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleEditMessage(editingMessage.id, editContent)}
                  disabled={!editContent.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Message Confirmation Modal */}
      <AnimatePresence>
        {deletingMessageId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingMessageId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-dd-surface border border-dd-border rounded-2xl p-5 shadow-2xl z-10"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-modal-title"
            >
              <h3 id="delete-modal-title" className="text-sm font-black text-dd-text mb-2">
                Excluir mensagem
              </h3>
              <p className="text-xs font-semibold text-dd-muted mb-4">
                Tem certeza que deseja excluir esta mensagem? Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeletingMessageId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-dd-muted hover:bg-dd-surface-hover hover:text-dd-text transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteMessage(deletingMessageId)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Forward Message Modal */}
      {forwardingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setForwardingMessage(null)}
          />

          <div className="relative w-full max-w-sm bg-dd-surface border border-dd-border rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-dd-border">
              <h3 className="font-extrabold text-sm text-dd-text">Encaminhar mensagem</h3>
              <button
                onClick={() => setForwardingMessage(null)}
                className="p-1 text-dd-muted hover:text-dd-text rounded-md transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="p-4 bg-dd-bg/50 border-b border-dd-border text-xs text-dd-muted italic max-h-24 overflow-y-auto font-semibold">
              &quot;{forwardingMessage.content}&quot;
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-dd-border/30 p-2">
              {chats.length <= 1 ? (
                <div className="text-center py-8 text-xs text-dd-muted font-semibold">
                  Nenhuma outra conversa ativa para encaminhar.
                </div>
              ) : (
                chats
                  .filter((c) => c.partnerId !== activeChat?.partnerId)
                  .map((item) => (
                    <button
                      key={item.partnerId}
                      onClick={() => handleForwardMessage(item.partnerId)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-dd-bg text-left transition-colors"
                    >
                      {item.partner.avatar_url ? (
                        <Image
                          src={item.partner.avatar_url}
                          alt={item.partner.username}
                          width={36}
                          height={36}
                          className="w-9 h-9 rounded-full object-cover border border-dd-border"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-500/10">
                          {item.partner.username.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-extrabold text-dd-text">
                          @{item.partner.username}
                        </p>
                      </div>
                    </button>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Message Info Modal */}
      {infoMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setInfoMessage(null)}
          />

          <div className="relative w-full max-w-xs bg-dd-surface border border-dd-border rounded-2xl p-5 shadow-2xl z-10 font-sans">
            <h3 className="text-sm font-black text-dd-text mb-4">Informações da Mensagem</h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between border-b border-dd-border/40 pb-2">
                <span className="text-dd-muted font-semibold">Enviada por:</span>
                <span className="text-dd-text font-bold">
                  {infoMessage.sender_id === user?.id ? 'Você' : `@${activeChat?.partner.username}`}
                </span>
              </div>

              <div className="flex justify-between border-b border-dd-border/40 pb-2">
                <span className="text-dd-muted font-semibold">Enviada em:</span>
                <span className="text-dd-text font-bold">
                  {new Date(infoMessage.created_at).toLocaleString('pt-BR')}
                </span>
              </div>

              <div className="flex justify-between border-b border-dd-border/40 pb-2">
                <span className="text-dd-muted font-semibold">Editada:</span>
                <span className="text-dd-text font-bold">
                  {infoMessage.is_edited ? 'Sim' : 'Não'}
                </span>
              </div>

              <div className="flex justify-between border-b border-dd-border/40 pb-2">
                <span className="text-dd-muted font-semibold">Tamanho:</span>
                <span className="text-dd-text font-bold">
                  {infoMessage.content.replace(/^⤷ Em resposta a @.+: "[\s\S]+"\n\n/, '').length}{' '}
                  caracteres
                </span>
              </div>
            </div>

            <button
              onClick={() => setInfoMessage(null)}
              className="mt-5 w-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-2 px-4 rounded-xl transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            key="dm-toast"
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-[200] bg-dd-surface border border-dd-border text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5"
          >
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
            <span className="text-dd-text">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
