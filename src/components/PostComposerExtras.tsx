'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Calendar, Flag, Globe, MapPin, Smile, Users, AtSign, X } from 'lucide-react';
import {
  QUICK_LOCATIONS,
  REPLY_AUDIENCE_OPTIONS,
  ReplyAudience,
  insertAtEditor,
} from '@/lib/post-composer';
import type { NotionEditorRef } from '@/components/editor/NotionEditor';
import { EmojiPicker } from '@/components/composer/EmojiPicker';
import { AnchoredPopover } from '@/components/composer/AnchoredPopover';
import { useLocalizedText } from '@/i18n/useLocalizedText';

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
  refs: React.RefObject<HTMLElement | null>[],
  onClose: () => void,
  active: boolean
) {
  useEffect(() => {
    if (!active) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (refs.some((ref) => ref.current?.contains(target))) return;
      onClose();
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [active, onClose, refs]);
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
  const { text, locale } = useLocalizedText();
  const [openPanel, setOpenPanel] = useState<'emoji' | 'reply' | 'schedule' | 'location' | null>(
    null
  );
  const [locationDraft, setLocationDraft] = useState(location);
  const panelRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const scheduleButtonRef = useRef<HTMLButtonElement>(null);
  const locationButtonRef = useRef<HTMLButtonElement>(null);
  // Popovers render in a portal, so they live outside panelRef in the DOM.
  const popoverRef = useRef<HTMLDivElement>(null);
  const [outsideRefs] = useState(() => [panelRef, popoverRef]);
  const closePanel = useCallback(() => setOpenPanel(null), []);

  useClickOutside(outsideRefs, closePanel, openPanel !== null);

  useEffect(() => {
    if (openPanel === 'location') {
      setLocationDraft(location);
    }
  }, [openPanel, location]);

  const replyOption =
    REPLY_AUDIENCE_OPTIONS.find((option) => option.value === replyAudience) ??
    REPLY_AUDIENCE_OPTIONS[0];
  const replyLabel = text(replyOption.label, replyOption.labelEn);

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
                  aria-label={text('Remover localização', 'Remove location')}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {scheduledAt && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold text-blue-400">
                <Calendar className="w-3 h-3" />
                {new Date(scheduledAt).toLocaleString(locale, {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
                <button
                  type="button"
                  onClick={() => setScheduledAt(null)}
                  className="hover:text-blue-300 cursor-pointer"
                  aria-label={text('Remover agendamento', 'Remove schedule')}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {isSensitive && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-[10px] font-bold text-red-400">
                <Flag className="w-3 h-3" />
                {text('Conteúdo sensível', 'Sensitive content')}
                <button
                  type="button"
                  onClick={() => setIsSensitive(false)}
                  className="hover:text-red-300 cursor-pointer"
                  aria-label={text(
                    'Remover aviso de conteúdo sensível',
                    'Remove sensitive content warning'
                  )}
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
                      <span className="block text-xs font-bold">
                        {text(option.label, option.labelEn)}
                      </span>
                      <span className="block text-[10px] text-dd-muted font-medium">
                        {text(option.description, option.descriptionEn)}
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
          ref={emojiButtonRef}
          type="button"
          onClick={() => togglePanel('emoji')}
          className={`p-2.5 rounded-full transition-colors cursor-pointer ${
            openPanel === 'emoji'
              ? 'bg-blue-500/20 text-blue-400'
              : 'text-blue-500 hover:bg-blue-500/10'
          }`}
          title="Emojis"
          aria-label="Emojis"
          aria-haspopup="dialog"
          aria-expanded={openPanel === 'emoji'}
        >
          <Smile className="w-5 h-5" />
        </button>

        {openPanel === 'emoji' && (
          <EmojiPicker
            anchorRef={emojiButtonRef}
            pickerRef={popoverRef}
            onSelect={insertEmoji}
            onClose={closePanel}
          />
        )}
      </div>

      {!contentToolsOnly && (
        <div className="relative">
          <button
            ref={scheduleButtonRef}
            type="button"
            onClick={() => togglePanel('schedule')}
            className={`p-2.5 rounded-full transition-colors cursor-pointer ${
              openPanel === 'schedule' || scheduledAt
                ? 'bg-blue-500/20 text-blue-400'
                : 'text-blue-500 hover:bg-blue-500/10'
            }`}
            title={text('Agendar publicação', 'Schedule post')}
            aria-label={text('Agendar publicação', 'Schedule post')}
            aria-haspopup="dialog"
            aria-expanded={openPanel === 'schedule'}
          >
            <Calendar className="w-5 h-5" />
          </button>

          {openPanel === 'schedule' && (
            <AnchoredPopover
              anchorRef={scheduleButtonRef}
              popoverRef={popoverRef}
              onClose={closePanel}
              label={text('Agendar publicação', 'Schedule post')}
              width={320}
              maxHeight={360}
            >
              <div className="flex max-h-[inherit] flex-col gap-3 overflow-y-auto p-4">
                <p className="text-[15px] font-extrabold text-dd-text">
                  {text('Agendar publicação', 'Schedule post')}
                </p>
                <input
                  type="datetime-local"
                  value={scheduledAt ?? ''}
                  onChange={(e) => setScheduledAt(e.target.value || null)}
                  className="h-11 w-full rounded-xl border border-dd-border bg-dd-bg px-3 text-sm text-dd-text transition-colors focus:border-dd-accent focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setScheduledAt(null);
                      setOpenPanel(null);
                    }}
                    className="h-9 flex-1 rounded-full border border-dd-border text-sm font-bold text-dd-text transition-colors hover:bg-dd-surface cursor-pointer"
                  >
                    {text('Limpar', 'Clear')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenPanel(null)}
                    className="h-9 flex-1 rounded-full bg-dd-accent text-sm font-bold text-white transition-opacity hover:opacity-90 cursor-pointer"
                  >
                    {text('Confirmar', 'Confirm')}
                  </button>
                </div>
              </div>
            </AnchoredPopover>
          )}
        </div>
      )}

      <div className="relative">
        <button
          ref={locationButtonRef}
          type="button"
          onClick={() => togglePanel('location')}
          className={`p-2.5 rounded-full transition-colors cursor-pointer ${
            openPanel === 'location' || location
              ? 'bg-blue-500/20 text-blue-400'
              : 'text-blue-500 hover:bg-blue-500/10'
          }`}
          title={text('Adicionar localização', 'Add location')}
          aria-label={text('Adicionar localização', 'Add location')}
          aria-haspopup="dialog"
          aria-expanded={openPanel === 'location'}
        >
          <MapPin className="w-5 h-5" />
        </button>

        {openPanel === 'location' && (
          <AnchoredPopover
            anchorRef={locationButtonRef}
            popoverRef={popoverRef}
            onClose={closePanel}
            label={text('Localização', 'Location')}
            width={320}
            maxHeight={380}
          >
            <div className="flex max-h-[inherit] flex-col gap-3 overflow-y-auto p-4">
              <p className="text-[15px] font-extrabold text-dd-text">
                {text('Localização', 'Location')}
              </p>
              <div className="group relative">
                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dd-muted transition-colors group-focus-within:text-dd-accent" />
                <input
                  type="text"
                  value={locationDraft}
                  onChange={(e) => setLocationDraft(e.target.value)}
                  onKeyDown={(e) => {
                    // Enter adds the location instead of submitting the post.
                    if (e.key !== 'Enter') return;
                    e.preventDefault();
                    if (!locationDraft.trim()) return;
                    setLocation(locationDraft.trim());
                    setOpenPanel(null);
                  }}
                  placeholder={text('Onde você está?', 'Where are you?')}
                  className="h-10 w-full rounded-full border border-transparent bg-dd-surface pl-10 pr-4 text-[15px] text-dd-text placeholder-dd-muted transition-colors focus:border-dd-accent focus:bg-dd-bg focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_LOCATIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setLocationDraft(item)}
                    className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
                      locationDraft === item
                        ? 'border-dd-accent bg-dd-accent/10 text-dd-accent'
                        : 'border-dd-border text-dd-text hover:bg-dd-surface'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={!locationDraft.trim()}
                onClick={() => {
                  setLocation(locationDraft.trim());
                  setOpenPanel(null);
                }}
                className="h-9 w-full rounded-full bg-dd-accent text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-50 cursor-pointer"
              >
                {text('Adicionar localização', 'Add location')}
              </button>
            </div>
          </AnchoredPopover>
        )}
      </div>

      <button
        type="button"
        onClick={() => setIsSensitive(!isSensitive)}
        className={`p-2.5 rounded-full transition-colors cursor-pointer ${
          isSensitive ? 'bg-red-500/20 text-red-400' : 'text-blue-500 hover:bg-blue-500/10'
        }`}
        title={text('Marcar como conteúdo sensível', 'Mark as sensitive content')}
      >
        <Flag className="w-5 h-5" />
      </button>
    </div>
  );
}
