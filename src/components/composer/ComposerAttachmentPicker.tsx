'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ImagePlus, LoaderCircle, Mic, Square, Upload, X } from 'lucide-react';
import type { PostAttachment } from '@/lib/post-content';
import type { SpotifyProfileTrack } from '@/lib/profile-music';
import { MusicSelector } from '@/components/profile-inline/MusicSelector';
import { KlipyGifSearch } from '@/components/gif/KlipyGifSearch';
import type { KlipyGif } from '@/lib/klipy';
import styles from './ComposerMedia.module.css';
import { useLocalizedText } from '@/i18n/useLocalizedText';

export type ComposerAttachmentPanel = 'gif' | 'music' | 'audio' | 'image' | null;
interface PickerProps {
  panel: ComposerAttachmentPanel;
  onClose: () => void;
  attachments: PostAttachment[];
  onAttachmentsChange: (attachments: PostAttachment[]) => void;
  music: SpotifyProfileTrack | null;
  onMusicChange: (music: SpotifyProfileTrack | null) => void;
  onBusyChange?: (busy: boolean) => void;
  /** Render as a fixed viewport sheet so inline nested composers do not clip or jump. */
  portal?: boolean;
}
type Translate = (portuguese: string, english: string) => string;
const portugueseOnly: Translate = (portuguese) => portuguese;

async function uploadPostMedia(
  file: File,
  signal?: AbortSignal,
  text: Translate = portugueseOnly
): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const response = await fetch('/api/posts/media', { method: 'POST', body: form, signal });
  const result = await response.json();
  if (!response.ok)
    throw new Error(
      result.message ||
        result.error ||
        text(
          'Não foi possível enviar o arquivo. Tente novamente.',
          'Could not upload the file. Try again.'
        )
    );
  if (typeof result.url !== 'string' || !/^\/api\/posts\/media\/[\w-]+$/.test(result.url))
    throw new Error(
      text(
        'O armazenamento não retornou um arquivo válido.',
        'Storage did not return a valid file.'
      )
    );
  return result.url;
}

export function ComposerAttachmentPicker(props: PickerProps) {
  return props.panel ? <AttachmentPanel key={props.panel} {...props} panel={props.panel} /> : null;
}

function AttachmentPanel({
  panel,
  onClose,
  attachments,
  onAttachmentsChange,
  music,
  onMusicChange,
  onBusyChange,
  portal = false,
}: PickerProps & { panel: Exclude<ComposerAttachmentPanel, null> }) {
  const { text } = useLocalizedText();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [requestingMicrophone, setRequestingMicrophone] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const mounted = useRef(true);
  const request = useRef<AbortController | null>(null);
  const requestMicrophoneRef = useRef(false);
  const busyCallback = useRef(onBusyChange);
  busyCallback.current = onBusyChange;
  const fileInput = useRef<HTMLInputElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!portal) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    if (panel !== 'gif') closeButton.current?.focus();
    return () => {
      previousFocus?.focus();
    };
  }, [portal, panel]);
  useEffect(() => {
    busyCallback.current?.(busy || recording || requestingMicrophone);
  }, [busy, recording, requestingMicrophone]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      request.current?.abort();
      if (recorder.current?.state === 'recording') recorder.current.stop();
      stream.current?.getTracks().forEach((track) => track.stop());
      busyCallback.current?.(false);
    };
  }, [panel]);
  useEffect(() => {
    if (!recorded) {
      setRecordedUrl('');
      return;
    }
    const url = URL.createObjectURL(recorded);
    setRecordedUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [recorded]);
  useEffect(() => {
    if (!recording) return;
    const start = Date.now();
    const timer = window.setInterval(() => {
      const seconds = Math.floor((Date.now() - start) / 1000);
      setElapsed(Math.min(120, seconds));
      if (seconds >= 120 && recorder.current?.state === 'recording') recorder.current.stop();
    }, 250);
    return () => window.clearInterval(timer);
  }, [recording]);
  const addFiles = async (files: File[]) => {
    if (busy || !files.length) return;
    const count = attachments.filter((item) => item.type !== 'audio').length;
    const slots = 4 - count;
    if (slots <= 0) {
      setError(
        text(
          'Você já adicionou 4 imagens ou GIFs. Remova um para continuar.',
          'You already added 4 images or GIFs. Remove one to continue.'
        )
      );
      return;
    }
    if (files.length > slots) {
      setError(`Você pode adicionar mais ${slots} ${slots === 1 ? 'imagem' : 'imagens'}.`);
      return;
    }
    setBusy(true);
    setError('');
    const controller = new AbortController();
    request.current = controller;
    let next = [...attachments];
    try {
      for (const file of files) {
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type))
          throw new Error(
            text('Escolha imagens JPEG, PNG, WebP ou GIF.', 'Choose JPEG, PNG, WebP or GIF images.')
          );
        if (file.size > 5 * 1024 * 1024)
          throw new Error(
            text('Cada imagem ou GIF pode ter até 5 MB.', 'Each image or GIF can be up to 5 MB.')
          );
        const url = await uploadPostMedia(file, controller.signal, text);
        next = [...next, { type: file.type === 'image/gif' ? 'gif' : 'image', url }];
        if (mounted.current) onAttachmentsChange(next);
      }
      if (mounted.current) onClose();
    } catch (failure) {
      if (mounted.current && !controller.signal.aborted)
        setError(
          failure instanceof Error
            ? failure.message
            : text('Não foi possível enviar o arquivo.', 'Could not upload the file.')
        );
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  const selectGif = (gif: KlipyGif) => {
    if (busy) return;
    if (attachments.filter((item) => item.type !== 'audio').length >= 4) {
      setError(text('O limite é de 4 imagens ou GIFs.', 'The limit is 4 images or GIFs.'));
      return;
    }
    if (attachments.some((item) => item.url === gif.url)) {
      setError(text('Esse GIF já foi adicionado.', 'That GIF is already added.'));
      return;
    }
    // KLIPY media must load from its own CDN, so the URL is stored as-is.
    onAttachmentsChange([...attachments, { type: 'gif', url: gif.url, alt: gif.title }]);
    onClose();
  };
  const startRecording = async () => {
    if (requestMicrophoneRef.current || recording || busy) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError(
        text(
          'Este navegador não permite gravação. Use outro navegador compatível.',
          'This browser does not allow recording. Use another compatible browser.'
        )
      );
      return;
    }
    requestMicrophoneRef.current = true;
    setRequestingMicrophone(true);
    setError('');
    try {
      const source = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mounted.current) {
        source.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = source;
      const mime = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'].find((value) =>
        MediaRecorder.isTypeSupported(value)
      );
      const nextRecorder = new MediaRecorder(source, mime ? { mimeType: mime } : undefined);
      const chunks: Blob[] = [];
      nextRecorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      nextRecorder.onstop = () => {
        source.getTracks().forEach((track) => track.stop());
        if (mounted.current) {
          setRecorded(new Blob(chunks, { type: nextRecorder.mimeType || 'audio/webm' }));
          setRecording(false);
        }
      };
      nextRecorder.onerror = () => {
        source.getTracks().forEach((track) => track.stop());
        if (mounted.current) {
          setRecording(false);
          setError(
            text(
              'A gravação foi interrompida. Tente gravar novamente.',
              'The recording was interrupted. Try recording again.'
            )
          );
        }
      };
      recorder.current = nextRecorder;
      setRecorded(null);
      setElapsed(0);
      nextRecorder.start(1000);
      setRecording(true);
    } catch (failure) {
      stream.current?.getTracks().forEach((track) => track.stop());
      if (mounted.current)
        setError(
          failure instanceof DOMException && failure.name === 'NotAllowedError'
            ? text(
                'Permita o acesso ao microfone nas configurações do navegador para gravar.',
                'Allow microphone access in your browser settings to record.'
              )
            : text(
                'Não foi possível acessar seu microfone. Verifique se outro aplicativo está usando ele.',
                'Could not access your microphone. Check whether another app is using it.'
              )
        );
    } finally {
      requestMicrophoneRef.current = false;
      if (mounted.current) setRequestingMicrophone(false);
    }
  };
  const saveRecording = async () => {
    if (!recorded || busy) return;
    setBusy(true);
    setError('');
    const controller = new AbortController();
    request.current = controller;
    try {
      const mime = recorded.type.split(';')[0];
      const extension = mime.includes('mp4') ? 'm4a' : mime.includes('ogg') ? 'ogg' : 'webm';
      const url = await uploadPostMedia(
        new File([recorded], `gravacao.${extension}`, { type: mime }),
        controller.signal,
        text
      );
      if (mounted.current) {
        onAttachmentsChange([
          ...attachments.filter((item) => item.type !== 'audio'),
          { type: 'audio', url },
        ]);
        onClose();
      }
    } catch (failure) {
      if (mounted.current && !controller.signal.aborted)
        setError(
          failure instanceof Error
            ? failure.message
            : text('Não foi possível enviar a gravação.', 'Could not upload the recording.')
        );
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  const close = useCallback(() => {
    if (!busy && !recording && !requestingMicrophone) onClose();
  }, [busy, recording, requestingMicrophone, onClose]);
  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        event.preventDefault();
        close();
      }
    };
    document.addEventListener('keydown', keyDown, true);
    return () => document.removeEventListener('keydown', keyDown, true);
  }, [close]);
  const title = {
    gif: text('Adicionar GIF', 'Add GIF'),
    music: text('Adicionar música', 'Add music'),
    audio: text('Gravar áudio', 'Record audio'),
    image: text('Adicionar imagens', 'Add images'),
  }[panel];
  const sheet = (
    <div
      className={
        portal ? `${styles.sheetBackdrop} ${styles.sheetBackdropFixed}` : styles.sheetBackdrop
      }
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <section role="dialog" aria-modal="true" aria-label={title} className={styles.sheet}>
        <header className={styles.sheetHeader}>
          <h3>{title}</h3>
          <button
            ref={closeButton}
            type="button"
            className={styles.iconButton}
            aria-label={text('Fechar seletor', 'Close picker')}
            onClick={close}
            disabled={busy || recording || requestingMicrophone}
          >
            <X size={20} />
          </button>
        </header>
        <div className={styles.sheetBody}>
          {panel === 'music' && (
            <MusicSelector
              value={music}
              onChange={(track) => {
                onMusicChange(
                  track
                    ? {
                        ...track,
                        title: track.title || text('Faixa do Spotify', 'Spotify track'),
                        artist: track.artist || '',
                      }
                    : null
                );
                if (track) onClose();
              }}
              context="post"
            />
          )}
          {(panel === 'gif' || panel === 'image') && (
            <>
              {panel === 'gif' && (
                <KlipyGifSearch
                  autoFocus
                  disabled={busy}
                  onSelect={selectGif}
                  unavailableMessage={text(
                    'A pesquisa de GIFs ainda não está disponível. Você pode enviar um GIF do seu dispositivo.',
                    'GIF search is not available yet. You can upload a GIF from your device.'
                  )}
                />
              )}
              {panel === 'image' && (
                <p className={styles.help}>
                  {text(
                    'Adicione até 4 imagens. JPEG, PNG e WebP são otimizados no envio; GIFs mantêm a animação. Até 5 MB por arquivo.',
                    'Add up to 4 images. JPEG, PNG and WebP are optimized on upload; GIFs keep their animation. Up to 5 MB per file.'
                  )}
                </p>
              )}
              <button
                type="button"
                className={styles.uploadButton}
                disabled={busy}
                onClick={() => fileInput.current?.click()}
              >
                {panel === 'gif' ? <Upload size={19} /> : <ImagePlus size={19} />}
                <span>
                  {panel === 'gif'
                    ? text('Escolher GIF do dispositivo', 'Choose GIF from device')
                    : text('Escolher imagens', 'Choose images')}
                </span>
              </button>
              <input
                ref={fileInput}
                type="file"
                hidden
                accept={panel === 'gif' ? 'image/gif' : 'image/jpeg,image/png,image/webp,image/gif'}
                multiple={panel === 'image'}
                disabled={busy}
                onChange={(event) => {
                  void addFiles(Array.from(event.target.files || []));
                  event.target.value = '';
                }}
              />
            </>
          )}
          {panel === 'audio' && (
            <>
              <p className={styles.help}>
                {text(
                  'Grave uma mensagem de até 2 minutos. Você pode ouvir e refazer antes de publicar.',
                  'Record a message of up to 2 minutes. You can listen and redo it before posting.'
                )}
              </p>
              <div className={styles.recording} role="status">
                {recording && <Mic size={20} />}
                <span>
                  {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}
                </span>
                {recording && <span>{text('Gravando', 'Recording')}</span>}
              </div>
              {recordedUrl && (
                <audio
                  className={styles.audioDraft}
                  controls
                  src={recordedUrl}
                  aria-label={text(
                    'Ouvir gravação antes de anexar',
                    'Listen to the recording before attaching'
                  )}
                />
              )}
              {recording ? (
                <button
                  type="button"
                  className={styles.recordButton}
                  onClick={() => recorder.current?.stop()}
                >
                  <Square size={17} />
                  {text('Finalizar gravação', 'Finish recording')}
                </button>
              ) : (
                <div className={styles.recordActions}>
                  <button
                    type="button"
                    className={styles.recordButton}
                    disabled={busy || requestingMicrophone}
                    onClick={() => void startRecording()}
                  >
                    <Mic size={17} />
                    {requestingMicrophone
                      ? text('Aguardando microfone…', 'Waiting for microphone…')
                      : recorded
                        ? text('Gravar novamente', 'Record again')
                        : text('Iniciar gravação', 'Start recording')}
                  </button>
                  {recorded && (
                    <button
                      type="button"
                      className={styles.recordButton}
                      disabled={busy}
                      onClick={() => void saveRecording()}
                    >
                      {text('Anexar áudio', 'Attach audio')}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
          {busy && (
            <p role="status" className={styles.status}>
              <LoaderCircle size={16} className="animate-spin" />
              {text('Enviando e preparando o anexo…', 'Uploading and preparing the attachment…')}
            </p>
          )}
          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}
        </div>
      </section>
    </div>
  );

  return portal && typeof document !== 'undefined' ? createPortal(sheet, document.body) : sheet;
}
