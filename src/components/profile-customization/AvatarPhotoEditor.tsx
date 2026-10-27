'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, Check, Trash2, Upload, X } from 'lucide-react';
import { cropAvatarPhoto } from './avatar-photo';
import styles from './Personalization.module.css';

type Source = { url: string; width: number; height: number };

export function AvatarPhotoEditor({
  avatarUrl,
  username,
  disabled,
  onPhotoSelected,
  onRemove,
  onError,
}: {
  avatarUrl: string | null;
  username: string;
  disabled: boolean;
  onPhotoSelected: (file: File, previewUrl: string) => void;
  onRemove: () => void;
  onError: (message: string) => void;
}) {
  const uploadRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef(0);
  const [source, setSource] = useState<Source | null>(null);
  const [zoom, setZoom] = useState(1);
  const [positionX, setPositionX] = useState(50);
  const [positionY, setPositionY] = useState(50);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return () => {
      if (source) URL.revokeObjectURL(source.url);
    };
  }, [source]);
  useEffect(
    () => () => {
      requestRef.current += 1;
    },
    []
  );

  async function choose(file?: File) {
    if (!file) return;
    if (
      !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      onError('Envie uma foto JPEG, PNG, WebP ou GIF de até 5 MB.');
      return;
    }
    const request = ++requestRef.current;
    setBusy(true);
    onError('');
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      if (request !== requestRef.current) {
        URL.revokeObjectURL(url);
        return;
      }
      if (
        image.naturalWidth < 32 ||
        image.naturalHeight < 32 ||
        image.naturalWidth > 12000 ||
        image.naturalHeight > 12000 ||
        image.naturalWidth * image.naturalHeight > 40_000_000
      )
        throw new Error('Use uma foto de pelo menos 32 × 32 pixels e até 40 megapixels.');
      setSource({ url, width: image.naturalWidth, height: image.naturalHeight });
      setZoom(1);
      setPositionX(50);
      setPositionY(50);
    } catch (failure) {
      URL.revokeObjectURL(url);
      onError(failure instanceof Error ? failure.message : 'Não foi possível abrir a foto.');
    } finally {
      if (request === requestRef.current) setBusy(false);
      if (uploadRef.current) uploadRef.current.value = '';
      if (cameraRef.current) cameraRef.current.value = '';
    }
  }

  async function applyCrop() {
    if (!source) return;
    setBusy(true);
    try {
      const file = await cropAvatarPhoto(source.url, zoom, positionX, positionY);
      onPhotoSelected(file, URL.createObjectURL(file));
      setSource(null);
    } catch (failure) {
      onError(failure instanceof Error ? failure.message : 'Não foi possível preparar a foto.');
    } finally {
      setBusy(false);
    }
  }

  const width = source ? (source.width / Math.min(source.width, source.height)) * zoom * 100 : 100;
  const height = source
    ? (source.height / Math.min(source.width, source.height)) * zoom * 100
    : 100;
  return (
    <section className={styles.photoEditor} aria-label="Foto do perfil">
      <h3 className={styles.label}>Foto do perfil</h3>
      <div className={styles.photoActions}>
        <div className={styles.photoCurrent}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={`Foto de ${username}`} />
          ) : (
            <span>{username.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <div>
          <div className={styles.row}>
            <input
              ref={uploadRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className={styles.hiddenInput}
              aria-label="Selecionar foto do perfil"
              disabled={disabled || busy}
              onChange={(event) => void choose(event.target.files?.[0])}
            />
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="user"
              className={styles.hiddenInput}
              aria-label="Tirar foto do perfil"
              disabled={disabled || busy}
              onChange={(event) => void choose(event.target.files?.[0])}
            />
            <button
              type="button"
              className={styles.button}
              disabled={disabled || busy}
              onClick={() => uploadRef.current?.click()}
            >
              <Upload size={16} /> {busy ? 'Preparando foto…' : 'Escolher foto'}
            </button>
            <button
              type="button"
              className={`${styles.button} ${styles.cameraButton}`}
              disabled={disabled || busy}
              onClick={() => cameraRef.current?.click()}
            >
              <Camera size={16} /> Tirar foto
            </button>
            {avatarUrl && (
              <button
                type="button"
                className={styles.quietButton}
                disabled={disabled || busy}
                onClick={() => {
                  setSource(null);
                  onRemove();
                }}
              >
                <Trash2 size={15} /> Remover foto
              </button>
            )}
          </div>
          <p className={styles.help}>
            JPEG, PNG, WebP ou GIF, até 5 MB. Recorte a foto e salve para publicar.
          </p>
        </div>
      </div>
      {source && (
        <div className={styles.cropEditor} aria-label="Recortar foto do perfil">
          <p className={styles.help}>
            Ajuste o enquadramento. A área circular aparece dentro da moldura.
          </p>
          <div className={styles.cropViewport}>
            <img
              src={source.url}
              alt="Prévia do recorte da foto"
              style={{
                width: `${width}%`,
                height: `${height}%`,
                left: `${((100 - width) * positionX) / 100}%`,
                top: `${((100 - height) * positionY) / 100}%`,
              }}
            />
          </div>
          <label className={styles.field}>
            <span className={styles.label}>Zoom da foto: {zoom.toFixed(1)}×</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              className={styles.range}
              onChange={(event) => setZoom(Number(event.target.value))}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Posição horizontal da foto: {positionX}%</span>
            <input
              type="range"
              min={0}
              max={100}
              value={positionX}
              className={styles.range}
              onChange={(event) => setPositionX(Number(event.target.value))}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Posição vertical da foto: {positionY}%</span>
            <input
              type="range"
              min={0}
              max={100}
              value={positionY}
              className={styles.range}
              onChange={(event) => setPositionY(Number(event.target.value))}
            />
          </label>
          <div className={styles.row}>
            <button
              type="button"
              className={styles.primary}
              disabled={disabled || busy}
              onClick={() => void applyCrop()}
            >
              <Check size={16} /> Aplicar recorte
            </button>
            <button
              type="button"
              className={styles.button}
              disabled={busy}
              onClick={() => setSource(null)}
            >
              <X size={16} /> Cancelar recorte
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
