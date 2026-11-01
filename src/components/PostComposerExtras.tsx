'use client';

import { useEffect, useRef, useState } from 'react';
import { Calendar, Flag, Globe, MapPin, Smile, Users, AtSign, X } from 'lucide-react';
import {
  EMOJI_CATEGORIES,
  QUICK_LOCATIONS,
  REPLY_AUDIENCE_OPTIONS,
  ReplyAudience,
  insertAtEditor,
} from '@/lib/post-composer';
import type { NotionEditorRef } from '@/components/editor/NotionEditor';

export interface PostComposerExtrasState {
  replyAudience: ReplyAudience;
  setReplyAudience: (value: ReplyAudience) => void;
  scheduledAt: string | null;
  setScheduledAt: (value: string | null) => void;
  location: string;
  setLocation: (value: string) => void;
  isSensitive: boolean;
  setIsSensitive: (value: boolean) => void;
}

interface PostComposerExtrasProps extends PostComposerExtrasState {
  postBody: string;
  setPostBody: (value: string) => void;
  editorRef: React.RefObject<NotionEditorRef | null>;
  section: 'meta' | 'tools';
  contentToolsOnly?: boolean;
}

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

export function PostComposerExtras({
  postBody,
  setPostBody,
  editorRef,
  replyAudience,
  setReplyAudience,
  scheduledAt,
  setScheduledAt,
  location,
  setLocation,
  isSensitive,
  setIsSensitive,
  section,
  contentToolsOnly = false,
}: PostComposerExtrasProps) {
  const [openPanel, setOpenPanel] = useState<'emoji' | 'reply' | 'schedule' | 'location' | null>(
    null
  );
  const [locationDraft, setLocationDraft] = useState(location);
  const panelRef = useRef<HTMLDivElement>(null);

  useClickOutside(panelRef, () => setOpenPanel(null), openPanel !== null);

  useEffect(() => {
    if (openPanel === 'location') {
      setLocationDraft(location);
    }
  }, [openPanel, location]);

  const replyLabel =
    REPLY_AUDIENCE_OPTIONS.find((option) => option.value === replyAudience)?.label ??
    REPLY_AUDIENCE_OPTIONS[0].label;

  const insertEmoji = (emoji: string) => {
    insertAtEditor(editorRef.current, emoji, postBody, setPostBody);
  };

  const togglePanel = (panel: typeof openPanel) => {
    setOpenPanel((current) => (current === panel ? null : panel));
  };

  if (section === 'meta') {
    return (
      <div ref={panelRef} className="space-y-2">
        {(location || scheduledAt || isSensitive) && (
          <div className="flex flex-wrap gap-2">
            {location && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold text-blue-400">
                <MapPin className="w-3 h-3" />
                {location}
                <button
                  type="button"
                  onClick={() => setLocation('')}
                  className="hover:text-blue-300 cursor-pointer"
                  aria-label="Remover localização"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {scheduledAt && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold text-blue-400">
                <Calendar className="w-3 h-3" />
                {new Date(scheduledAt).toLocaleString('pt-BR', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
                <button
                  type="button"
                  onClick={() => setScheduledAt(null)}
                  className="hover:text-blue-300 cursor-pointer"
                  aria-label="Remover agendamento"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {isSensitive && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-[10px] font-bold text-red-400">
                <Flag className="w-3 h-3" />
                Conteúdo sensível
                <button
                  type="button"
                  onClick={() => setIsSensitive(false)}
                  className="hover:text-red-300 cursor-pointer"
                  aria-label="Remover aviso de conteúdo sensível"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {!contentToolsOnly && (
          <div className="relative w-fit">
            <button
              type="button"
              onClick={() => togglePanel('reply')}
              className="flex items-center gap-2 text-blue-500 hover:text-blue-400 font-extrabold text-xs cursor-pointer w-fit py-1.5 px-3 hover:bg-blue-500/10 rounded-full transition-colors"
            >
              {replyAudience === 'everyone' && <Globe className="w-4 h-4 shrink-0" />}
              {replyAudience === 'followers' && <Users className="w-4 h-4 shrink-0" />}
              {replyAudience === 'mentioned' && <AtSign className="w-4 h-4 shrink-0" />}
              <span>{replyLabel}</span>
            </button>

            {openPanel === 'reply' && (
              <div className="fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-[100] max-h-[min(60dvh,22rem)] overflow-y-auto rounded-2xl border border-dd-border/80 bg-dd-surface/95 p-2 shadow-2xl backdrop-blur-md animate-slide-up sm:absolute sm:inset-auto sm:left-0 sm:top-full sm:mt-1.5 sm:w-72 sm:max-h-none">
                {REPLY_AUDIENCE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setReplyAudience(option.value);
                      setOpenPanel(null);
                    }}
                    className={`flex w-full items-start gap-3 rounded-xl px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                      replyAudience === option.value
                        ? 'bg-blue-500/10 text-blue-400 font-bold'
                        : 'text-dd-text hover:bg-blue-500/5 hover:text-blue-400'
                    }`}
                  >
                    {option.value === 'everyone' && (
                      <Globe className="w-4.5 h-4.5 mt-0.5 shrink-0" />
                    )}
                    {option.value === 'followers' && (
                      <Users className="w-4.5 h-4.5 mt-0.5 shrink-0" />
                    )}
                    {option.value === 'mentioned' && (
                      <AtSign className="w-4.5 h-4.5 mt-0.5 shrink-0" />
                    )}
                    <span>
                      <span className="block text-xs font-bold">{option.label}</span>
                      <span className="block text-[10px] text-dd-muted font-medium">
                        {option.description}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={panelRef} className="flex items-center gap-2">
      <div className="relative">
        <button
          type="button"
          onClick={() => togglePanel('emoji')}
          className={`p-2.5 rounded-full transition-colors cursor-pointer ${
            openPanel === 'emoji'
              ? 'bg-blue-500/20 text-blue-400'
              : 'text-blue-500 hover:bg-blue-500/10'
          }`}
          title="Emojis"
        >
          <Smile className="w-5 h-5" />
        </button>

        {openPanel === 'emoji' && (
          <div className="fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-[100] max-h-[min(60dvh,22rem)] overflow-y-auto rounded-xl border border-dd-border/80 bg-dd-surface/95 p-3 shadow-2xl backdrop-blur-md animate-slide-up sm:absolute sm:inset-auto sm:left-0 sm:bottom-full sm:mb-2 sm:w-72 sm:max-h-none">
            <p className="text-[10px] font-bold uppercase tracking-wider text-dd-muted mb-2">
              Emojis
            </p>
            <div className="space-y-3 max-h-52 overflow-y-auto">
              {EMOJI_CATEGORIES.map((category) => (
                <div key={category.name}>
                  <p className="text-[10px] font-bold text-blue-400 mb-1.5">{category.name}</p>
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
          </div>
        )}
      </div>

      {!contentToolsOnly && (
        <div className="relative">
          <button
            type="button"
            onClick={() => togglePanel('schedule')}
            className={`p-2.5 rounded-full transition-colors cursor-pointer ${
              openPanel === 'schedule' || scheduledAt
                ? 'bg-blue-500/20 text-blue-400'
                : 'text-blue-500 hover:bg-blue-500/10'
            }`}
            title="Agendar publicação"
          >
            <Calendar className="w-5 h-5" />
          </button>

          {openPanel === 'schedule' && (
            <div className="fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-[100] max-h-[min(60dvh,22rem)] overflow-y-auto rounded-xl border border-dd-border/80 bg-dd-surface/95 p-3 shadow-2xl backdrop-blur-md animate-slide-up space-y-3 sm:absolute sm:inset-auto sm:left-0 sm:bottom-full sm:mb-2 sm:w-64 sm:max-h-none">
              <p className="text-xs font-bold text-dd-text">Agendar publicação</p>
              <input
                type="datetime-local"
                value={scheduledAt ?? ''}
                onChange={(e) => setScheduledAt(e.target.value || null)}
                className="w-full rounded-lg border border-dd-border bg-dd-bg px-2.5 py-2 text-xs text-dd-text focus:border-blue-500/65 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setScheduledAt(null);
                    setOpenPanel(null);
                  }}
                  className="flex-1 rounded-lg border border-dd-border px-2 py-1.5 text-[10px] font-bold text-dd-muted hover:text-dd-text cursor-pointer"
                >
                  Limpar
                </button>
                <button
                  type="button"
                  onClick={() => setOpenPanel(null)}
                  className="flex-1 rounded-lg bg-blue-500 px-2 py-1.5 text-[10px] font-bold text-white hover:bg-blue-600 cursor-pointer"
                >
                  Confirmar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => togglePanel('location')}
          className={`p-2.5 rounded-full transition-colors cursor-pointer ${
            openPanel === 'location' || location
              ? 'bg-blue-500/20 text-blue-400'
              : 'text-blue-500 hover:bg-blue-500/10'
          }`}
          title="Adicionar localização"
        >
          <MapPin className="w-5 h-5" />
        </button>

        {openPanel === 'location' && (
          <div className="fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-[100] max-h-[min(60dvh,22rem)] overflow-y-auto rounded-xl border border-dd-border/80 bg-dd-surface/95 p-3 shadow-2xl backdrop-blur-md animate-slide-up space-y-3 sm:absolute sm:inset-auto sm:left-0 sm:bottom-full sm:mb-2 sm:w-64 sm:max-h-none">
            <p className="text-xs font-bold text-dd-text">Localização</p>
            <input
              type="text"
              value={locationDraft}
              onChange={(e) => setLocationDraft(e.target.value)}
              placeholder="Onde você está?"
              className="w-full rounded-lg border border-dd-border bg-dd-bg px-2.5 py-2 text-xs text-dd-text placeholder-dd-muted focus:border-blue-500/65 focus:outline-none"
            />
            <div className="flex flex-wrap gap-1.5">
              {QUICK_LOCATIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLocationDraft(item)}
                  className="rounded-full border border-dd-border px-2 py-1 text-[10px] font-bold text-dd-muted hover:text-blue-400 hover:border-blue-500/30 cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setLocation(locationDraft.trim());
                setOpenPanel(null);
              }}
              className="w-full rounded-lg bg-blue-500 px-2 py-1.5 text-[10px] font-bold text-white hover:bg-blue-600 cursor-pointer"
            >
              Adicionar localização
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setIsSensitive(!isSensitive)}
        className={`p-2.5 rounded-full transition-colors cursor-pointer ${
          isSensitive ? 'bg-red-500/20 text-red-400' : 'text-blue-500 hover:bg-blue-500/10'
        }`}
        title="Marcar como conteúdo sensível"
      >
        <Flag className="w-5 h-5" />
      </button>
    </div>
  );
}
