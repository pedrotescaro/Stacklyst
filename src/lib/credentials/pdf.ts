import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, PDFName, PDFString, rgb, type PDFPage, type PDFFont } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import QRCode from 'qrcode';
import sharp from 'sharp';
import { brandGeometry } from '@/lib/brand-geometry';
import type { CredentialRecord } from '@/lib/credentials/types';
import { renderCredentialBadgeSvg } from '@/lib/credentials/badge-art';

const PAGE_WIDTH = 841.89;
const PAGE_HEIGHT = 595.28;
const INK = '#152b43';
const MUTED = '#506176';
const BLUE = '#0083fe';

function color(hex: string) {
  return rgb(
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255
  );
}

let assetsPromise: Promise<Buffer[]> | undefined;
function loadAssets() {
  assetsPromise ??= Promise.all(
    ['Sora-Regular.ttf', 'Sora-SemiBold.ttf', 'Sora-Bold.ttf', 'signature.png'].map((name) =>
      readFile(path.join(process.cwd(), 'public', 'assets', 'credentials', name))
    )
  ).catch((error: unknown) => {
    assetsPromise = undefined;
    throw error;
  });
  return assetsPromise;
}

function cleanText(value: string) {
  return value
    .normalize('NFC')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function wrapText(value: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const result: string[] = [];
  let line = '';
  for (const word of cleanText(value).split(' ')) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
      continue;
    }
    if (line) result.push(line);
    line = '';
    // Usernames and long unspaced names still need to stay inside the page.
    for (const character of word) {
      if (line && font.widthOfTextAtSize(line + character, size) > maxWidth) {
        result.push(line);
        line = '';
      }
      line += character;
    }
  }
  if (line) result.push(line);
  return result;
}

function fittedText(
  value: string,
  font: PDFFont,
  maximumSize: number,
  minimumSize: number,
  width: number,
  maxLines: number
) {
  for (let size = maximumSize; size >= minimumSize; size -= 0.5) {
    const lines = wrapText(value, font, size, width);
    if (lines.length <= maxLines) return { lines, size };
  }
  return { lines: wrapText(value, font, minimumSize, width), size: minimumSize };
}

function centerText(
  page: PDFPage,
  text: string,
  y: number,
  size: number,
  font: PDFFont,
  hex = INK,
  center = PAGE_WIDTH / 2
) {
  page.drawText(text, {
    x: center - font.widthOfTextAtSize(text, size) / 2,
    y,
    size,
    font,
    color: color(hex),
  });
}

const badgeImages = new Map<string, Promise<Buffer>>();
function loadBadge(record: CredentialRecord) {
  const { language, kind } = record.definition;
  const key = `${language}:${kind}`;
  let pending = badgeImages.get(key);
  if (!pending) {
    // Share only the badge artwork with the browser; preserve the existing PDF template.
    pending = sharp(
      Buffer.from(renderCredentialBadgeSvg({ language, kind, idPrefix: 'certificate-badge' }))
    )
      .resize(720, 780)
      .png()
      .toBuffer()
      .catch((error: unknown) => {
        badgeImages.delete(key);
        throw error;
      });
    badgeImages.set(key, pending);
  }
  return pending;
}

async function drawBadge(page: PDFPage, document: PDFDocument, record: CredentialRecord) {
  const artwork = await document.embedPng(await loadBadge(record));
  const scale = 0.33;
  page.drawImage(artwork, {
    x: 727,
    y: 552 - 260 * scale,
    width: 240 * scale,
    height: 260 * scale,
  });
}

function dateLabel(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error('A credencial não contém uma data válida.');
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeZone: 'America/Sao_Paulo',
  }).format(date);
}

function estimatedWorkload(minutes: number) {
  if (!Number.isFinite(minutes) || minutes <= 0) return null;
  const rounded = Math.round(minutes);
  const hours = Math.floor(rounded / 60);
  const remaining = rounded % 60;
  return hours ? `${hours} h${remaining ? ` ${remaining} min` : ''}` : `${remaining} min`;
}

/** A visual issuer signature accompanies an independently verifiable credential record. */
export async function renderCredentialPdf(
  record: CredentialRecord,
  verificationUrl: string
): Promise<Uint8Array> {
  if (record.status !== 'valid') throw new Error('Esta credencial não está válida para emissão.');
  const url = new URL(verificationUrl);
  if (
    url.protocol !== 'https:' &&
    !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))
  )
    throw new Error('URL de verificação inválida.');
  const [regularBytes, semiBoldBytes, boldBytes, signatureBytes] = await loadAssets();
  const document = await PDFDocument.create();
  document.registerFontkit(fontkit);
  const [regular, semiBold, bold, signature] = await Promise.all([
    document.embedFont(regularBytes, { subset: true }),
    document.embedFont(semiBoldBytes, { subset: true }),
    document.embedFont(boldBytes, { subset: true }),
    document.embedPng(signatureBytes),
  ]);
  const page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  document.setTitle(`Certificado de conclusão - ${cleanText(record.definition.title)}`);
  document.setAuthor('Stacklyst');
  document.setSubject(`Credencial ${record.id}`);
  document.setCreator('Stacklyst');
  document.setProducer('Stacklyst');
  document.setLanguage('pt-BR');
  document.setCreationDate(new Date(record.issuedAt));
  document.setModificationDate(new Date(record.issuedAt));

  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: rgb(1, 1, 1) });
  page.drawRectangle({
    x: 24,
    y: 24,
    width: PAGE_WIDTH - 48,
    height: PAGE_HEIGHT - 48,
    borderColor: color('#d8e2ec'),
    borderWidth: 0.75,
  });
  page.drawLine({
    start: { x: 48, y: 565 },
    end: { x: PAGE_WIDTH - 48, y: 565 },
    thickness: 2,
    color: color(BLUE),
  });

  const logoScale = 0.052;
  const logoX = (PAGE_WIDTH - brandGeometry.wordmarkWidth * logoScale) / 2;
  page.drawSvgPath(brandGeometry.path, { x: logoX, y: 551, scale: logoScale, color: color(BLUE) });
  page.drawSvgPath(brandGeometry.suffixPath, {
    x: logoX + 904 * logoScale,
    y: 551,
    scale: logoScale,
    color: color(BLUE),
  });
  await drawBadge(page, document, record);

  centerText(page, 'Certificado de conclusão', 474, 22, semiBold);
  const recipient = fittedText(record.recipientName, bold, 32, 18, 680, 2);
  for (let index = 0; index < recipient.lines.length; index++)
    centerText(
      page,
      recipient.lines[index],
      427 - index * recipient.size * 1.2,
      recipient.size,
      bold
    );
  centerText(page, 'concluiu os requisitos de aprendizagem de', 367, 13, regular, MUTED);
  const title = fittedText(record.definition.title, semiBold, 25, 15, 680, 3);
  for (let index = 0; index < title.lines.length; index++)
    centerText(page, title.lines[index], 334 - index * title.size * 1.18, title.size, semiBold);

  const workload = estimatedWorkload(record.definition.estimatedMinutes);
  const details = `Conclusão verificada em ${dateLabel(record.verifiedAt)}${workload ? `  |  Carga estimada: ${workload}` : ''}`;
  centerText(page, details, 246, 10.5, regular, MUTED);
  const visibleSkills: string[] = [];
  for (const skill of record.definition.skills) {
    if (wrapText([...visibleSkills, skill].join('  •  '), regular, 10.5, 640).length > 2) break;
    visibleSkills.push(skill);
  }
  if (record.definition.skills.length) {
    centerText(page, 'Competências demonstradas', 220, 11, semiBold, INK);
    const skills = fittedText(visibleSkills.join('  •  '), regular, 10.5, 9, 640, 2);
    for (let index = 0; index < skills.lines.length; index++)
      centerText(page, skills.lines[index], 199 - index * 15, skills.size, regular, MUTED);
    if (visibleSkills.length < record.definition.skills.length)
      centerText(
        page,
        'Consulte a lista completa de competências na página de verificação.',
        168,
        8.5,
        regular,
        MUTED
      );
  }

  // Keep the user's original transparent PNG intact; only its display rectangle changes.
  page.drawImage(signature, { x: 101, y: 101, width: 175, height: 52.5 });
  page.drawLine({
    start: { x: 99, y: 111 },
    end: { x: 278, y: 111 },
    thickness: 0.6,
    color: color('#b6c3d0'),
  });
  centerText(page, 'Stacklyst', 95, 12, semiBold, INK, 188.5);
  centerText(page, 'Plataforma de aprendizagem', 80, 8.5, regular, MUTED, 188.5);

  const qr = QRCode.create(url.href, { errorCorrectionLevel: 'M' });
  const qrX = 681;
  const qrY = 87;
  const qrSize = 79;
  const quiet = 4;
  const moduleSize = qrSize / (qr.modules.size + quiet * 2);
  page.drawRectangle({ x: qrX, y: qrY, width: qrSize, height: qrSize, color: rgb(1, 1, 1) });
  for (let row = 0; row < qr.modules.size; row++) {
    for (let column = 0; column < qr.modules.size; column++) {
      if (!qr.modules.get(row, column)) continue;
      page.drawRectangle({
        x: qrX + (column + quiet) * moduleSize,
        y: qrY + (qr.modules.size - row - 1 + quiet) * moduleSize,
        width: moduleSize,
        height: moduleSize,
        color: rgb(0, 0, 0),
      });
    }
  }
  centerText(page, 'Verifique esta conquista', 76, 8.5, semiBold, INK, qrX + qrSize / 2);
  const link = document.context.obj({
    Type: 'Annot',
    Subtype: 'Link',
    Rect: [qrX, qrY, qrX + qrSize, qrY + qrSize],
    Border: [0, 0, 0],
    A: { Type: 'Action', S: 'URI', URI: PDFString.of(url.href) },
  });

  centerText(
    page,
    `ID da credencial: ${cleanText(record.id)}  |  Emitido em ${dateLabel(record.issuedAt)}`,
    58,
    8.5,
    regular,
    MUTED
  );
  const readableUrl = url.href.replace(/^https?:\/\//, '');
  const urlSize = Math.min(8, 730 / Math.max(1, regular.widthOfTextAtSize(readableUrl, 1)));
  centerText(page, readableUrl, 44, urlSize, regular, BLUE);
  const linkWidth = regular.widthOfTextAtSize(readableUrl, urlSize);
  const textLink = document.context.obj({
    Type: 'Annot',
    Subtype: 'Link',
    Rect: [(PAGE_WIDTH - linkWidth) / 2, 42, (PAGE_WIDTH + linkWidth) / 2, 54],
    Border: [0, 0, 0],
    A: { Type: 'Action', S: 'URI', URI: PDFString.of(url.href) },
  });
  page.node.set(PDFName.of('Annots'), document.context.obj([link, textLink]));
  centerText(
    page,
    `SHA-256 do registro: ${cleanText(record.integrityHash)}`,
    31,
    7.5,
    regular,
    MUTED
  );

  return document.save();
}
