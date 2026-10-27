export function avatarCropRect(
  width: number,
  height: number,
  zoom: number,
  positionX: number,
  positionY: number
) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0)
    throw new Error('A imagem não tem dimensões válidas.');
  const safeZoom = Math.min(3, Math.max(1, Number.isFinite(zoom) ? zoom : 1));
  const size = Math.min(width, height) / safeZoom;
  const x = Math.min(100, Math.max(0, Number.isFinite(positionX) ? positionX : 50));
  const y = Math.min(100, Math.max(0, Number.isFinite(positionY) ? positionY : 50));
  return { x: ((width - size) * x) / 100, y: ((height - size) * y) / 100, size };
}

export async function cropAvatarPhoto(
  source: string,
  zoom: number,
  positionX: number,
  positionY: number
) {
  const image = new Image();
  image.src = source;
  await image.decode();
  const crop = avatarCropRect(image.naturalWidth, image.naturalHeight, zoom, positionX, positionY);
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Não foi possível recortar. Tente outro navegador.');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, 512, 512);
  context.drawImage(image, crop.x, crop.y, crop.size, crop.size, 0, 0, 512, 512);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (value) => (value ? resolve(value) : reject(new Error('Não foi possível preparar a foto.'))),
      'image/jpeg',
      0.92
    )
  );
  return new File([blob], 'foto-perfil.jpg', { type: 'image/jpeg' });
}
