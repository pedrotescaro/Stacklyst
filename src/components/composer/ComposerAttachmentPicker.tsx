'use client';

/* Protected media and GIF previews are requested directly by the browser. */
/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ImagePlus, LoaderCircle, Mic, Square, Upload, X } from 'lucide-react';
import type { PostAttachment } from '@/lib/post-content';
import type { SpotifyProfileTrack } from '@/lib/profile-music';
import { MusicSelector } from '@/components/profile-inline/MusicSelector';
import styles from './ComposerMedia.module.css';

export type ComposerAttachmentPanel = 'gif' | 'music' | 'audio' | 'image' | null;
interface PickerProps {
  panel: ComposerAttachmentPanel;
  onClose: () => void;
  attachments: PostAttachment[];
  onAttachmentsChange: (attachments: PostAttachment[]) => void;
  music: SpotifyProfileTrack | null;
  onMusicChange: (music: SpotifyProfileTrack | null) => void;
  onBusyChange?: (busy: boolean) => void;
}
type GifResult = { id: string; title: string; preview: string; url: string };
type GiphyItem = {
  id: string;
  title?: string;
  images?: { fixed_width?: { url?: string }; original?: { url?: string; size?: string } };
};
const safeGiphyUrl = (value: string | undefined) => {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      /(^|\.)giphy\.com$/.test(url.hostname) &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
};

async function uploadPostMedia(file: File, signal?: AbortSignal): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const response = await fetch('/api/posts/media', { method: 'POST', body: form, signal });
  const result = await response.json();
  if (!response.ok)
    throw new Error(
      result.message || result.error || 'Não foi possível enviar o arquivo. Tente novamente.'
    );
  if (typeof result.url !== 'string' || !/^\/api\/posts\/media\/[\w-]+$/.test(result.url))
    throw new Error('O armazenamento não retornou um arquivo válido.');
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
}: PickerProps & { panel: Exclude<ComposerAttachmentPanel, null> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState<GifResult[]>([]);
  const [searching, setSearching] = useState(false);
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
  const searchInput = useRef<HTMLInputElement>(null);
  const key = process.env.NEXT_PUBLIC_GIPHY_API_KEY;
  useEffect(() => {
    busyCallback.current?.(busy || recording || requestingMicrophone);
  }, [busy, recording, requestingMicrophone]);
  useEffect(() => {
    mounted.current = true;
    if (panel === 'gif') searchInput.current?.focus();
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
  useEffect(() => {
    if (panel !== 'gif' || !key) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      setError('');
      const params = new URLSearchParams({ api_key: key, limit: '20', rating: 'g', lang: 'pt' });
      if (query.trim()) params.set('q', query.trim());
      try {
        const response = await fetch(
          `https://api.giphy.com/v1/gifs/${query.trim() ? 'search' : 'trending'}?${params}`,
          { signal: controller.signal }
        );
        if (!response.ok)
          throw new Error(
            'A pesquisa de GIFs está indisponível. Tente novamente ou envie um arquivo.'
          );
        const result = (await response.json()) as { data?: GiphyItem[] };
        const next = (result.data || []).flatMap((gif) => {
          const preview = safeGiphyUrl(gif.images?.fixed_width?.url);
          const url = safeGiphyUrl(gif.images?.original?.url);
          return preview && url && Number(gif.images?.original?.size || 0) <= 5 * 1024 * 1024
            ? [{ id: gif.id, title: gif.title || 'GIF', preview, url }]
            : [];
        });
        if (!controller.signal.aborted) setGifs(next);
      } catch (failure) {
        if (!controller.signal.aborted)
          setError(failure instanceof Error ? failure.message : 'Não foi possível pesquisar GIFs.');
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 350);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, panel, key]);
  const addFiles = async (files: File[]) => {
    if (busy || !files.length) return;
    const count = attachments.filter((item) => item.type !== 'audio').length;
    const slots = 4 - count;
    if (slots <= 0) {
      setError('Você já adicionou 4 imagens ou GIFs. Remova um para continuar.');
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
          throw new Error('Escolha imagens JPEG, PNG, WebP ou GIF.');
        if (file.size > 5 * 1024 * 1024) throw new Error('Cada imagem ou GIF pode ter até 5 MB.');
        const url = await uploadPostMedia(file, controller.signal);
        next = [...next, { type: file.type === 'image/gif' ? 'gif' : 'image', url }];
        if (mounted.current) onAttachmentsChange(next);
      }
      if (mounted.current) onClose();
    } catch (failure) {
      if (mounted.current && !controller.signal.aborted)
        setError(failure instanceof Error ? failure.message : 'Não foi possível enviar o arquivo.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  const selectGif = async (gif: GifResult) => {
    if (busy) return;
    if (attachments.filter((item) => item.type !== 'audio').length >= 4) {
      setError('O limite é de 4 imagens ou GIFs.');
      return;
    }
    setBusy(true);
    setError('');
    const controller = new AbortController();
    request.current = controller;
    try {
      const response = await fetch(gif.url, { signal: controller.signal });
      if (!response.ok) throw new Error('Não foi possível baixar esse GIF. Escolha outro.');
      const blob = await response.blob();
      if (blob.size > 5 * 1024 * 1024) throw new Error('Esse GIF ultrapassa 5 MB. Escolha outro.');
      const file = new File([blob], `${gif.id}.gif`, { type: 'image/gif' });
      const url = await uploadPostMedia(file, controller.signal);
      if (mounted.current) {
        onAttachmentsChange([...attachments, { type: 'gif', url, alt: gif.title }]);
        onClose();
      }
    } catch (failure) {
      if (mounted.current && !controller.signal.aborted)
        setError(failure instanceof Error ? failure.message : 'Não foi possível adicionar o GIF.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  const startRecording = async () => {
    if (requestMicrophoneRef.current || recording || busy) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Este navegador não permite gravação. Use outro navegador compatível.');
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
          setError('A gravação foi interrompida. Tente gravar novamente.');
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
            ? 'Permita o acesso ao microfone nas configurações do navegador para gravar.'
            : 'Não foi possível acessar seu microfone. Verifique se outro aplicativo está usando ele.'
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
        controller.signal
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
          failure instanceof Error ? failure.message : 'Não foi possível enviar a gravação.'
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
    gif: 'Adicionar GIF',
    music: 'Adicionar música',
    audio: 'Gravar áudio',
    image: 'Adicionar imagens',
  }[panel];
  return (
    <div
      className={styles.sheetBackdrop}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <section role="dialog" aria-modal="true" aria-label={title} className={styles.sheet}>
        <header className={styles.sheetHeader}>
          <h3>{title}</h3>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Fechar seletor"
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
                        title: track.title || 'Faixa do Spotify',
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
                <>
                  <input
                    ref={searchInput}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    disabled={!key || busy}
                    maxLength={100}
                    className={styles.searchInput}
                    aria-label="Pesquisar GIFs"
                    placeholder="Pesquisar GIFs"
                  />
                  {!key && (
                    <p className={styles.help} style={{ marginTop: 10 }}>
                      A pesquisa de GIFs ainda não está disponível. Você pode enviar um GIF do seu
                      dispositivo.
                    </p>
                  )}
                  {searching && (
                    <p role="status" className={styles.status}>
                      <LoaderCircle size={16} className="animate-spin" />
                      Pesquisando GIFs…
                    </p>
                  )}
                  {!!gifs.length && (
                    <div className={styles.gifGrid}>
                      {gifs.map((gif) => (
                        <button
                          key={gif.id}
                          type="button"
                          disabled={busy}
                          onClick={() => void selectGif(gif)}
                          aria-label={`Adicionar ${gif.title}`}
                        >
                          <img src={gif.preview} alt={gif.title} loading="lazy" />
                        </button>
                      ))}
                    </div>
                  )}
                  {key && !searching && query && !gifs.length && !error && (
                    <p role="status" className={styles.help}>
                      Nenhum GIF encontrado. Tente outra palavra.
                    </p>
                  )}
                  {key && (
                    <a
                      className={styles.help}
                      href="https://giphy.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Powered by GIPHY
                    </a>
                  )}
                </>
              )}
              {panel === 'image' && (
                <p className={styles.help}>
                  Adicione até 4 imagens. JPEG, PNG e WebP são otimizados no envio; GIFs mantêm a
                  animação. Até 5 MB por arquivo.
                </p>
              )}
              <button
                type="button"
                className={styles.uploadButton}
                disabled={busy}
                onClick={() => fileInput.current?.click()}
              >
                {panel === 'gif' ? <Upload size={19} /> : <ImagePlus size={19} />}
                <span>{panel === 'gif' ? 'Escolher GIF do dispositivo' : 'Escolher imagens'}</span>
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
                Grave uma mensagem de até 2 minutos. Você pode ouvir e refazer antes de publicar.
              </p>
              <div className={styles.recording} role="status">
                {recording && <Mic size={20} />}
                <span>
                  {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}
                </span>
                {recording && <span>Gravando</span>}
              </div>
              {recordedUrl && (
                <audio
                  className={styles.audioDraft}
                  controls
                  src={recordedUrl}
                  aria-label="Ouvir gravação antes de anexar"
                />
              )}
              {recording ? (
                <button
                  type="button"
                  className={styles.recordButton}
                  onClick={() => recorder.current?.stop()}
                >
                  <Square size={17} />
                  Finalizar gravação
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
                      ? 'Aguardando microfone…'
                      : recorded
                        ? 'Gravar novamente'
                        : 'Iniciar gravação'}
                  </button>
                  {recorded && (
                    <button
                      type="button"
                      className={styles.recordButton}
                      disabled={busy}
                      onClick={() => void saveRecording()}
                    >
                      Anexar áudio
                    </button>
                  )}
                </div>
              )}
            </>
          )}
          {busy && (
            <p role="status" className={styles.status}>
              <LoaderCircle size={16} className="animate-spin" />
              Enviando e preparando o anexo…
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
}
