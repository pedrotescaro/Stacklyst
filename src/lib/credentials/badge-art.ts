import { credentialLanguageLogo } from './language-logos';
import { credentialRibbonOutlines } from './badge-lettering';

/** Shared vector paths for the credential badge and the printed certificate seal. */
export const credentialBadgePaths = {
  shield:
    'M120 10 C145 25 177 36 209 46 V123 C209 181 167 224 120 249 C73 224 31 181 31 123 V46 C63 36 95 25 120 10 Z',
  shieldInset:
    'M120 15 C145 30 175 40 204 50 V123 C204 177 165 218 120 243 C75 218 36 177 36 123 V50 C65 40 95 30 120 15 Z',
  shieldField:
    'M120 24 C144 37 172 47 196 55 V123 C196 172 161 210 120 234 C79 210 44 172 44 123 V55 C68 47 96 37 120 24 Z',
  ribbon:
    'M18 170 L59 163 L59 197 L18 205 L29 187 Z M222 170 L181 163 L181 197 L222 205 L211 187 Z',
  ribbonFront: 'M40 168 Q120 182 200 168 L200 198 Q120 212 40 198 Z',
  ribbonFold: 'M48 193 L59 201 L59 195 Z M192 193 L181 201 L181 195 Z',
  leftStem: 'M78 157 C52 145 44 118 54 91',
  rightStem: 'M162 157 C188 145 196 118 186 91',
  leaf: 'M0 0 C-13 -2 -18 -11 -15 -17 C-6 -16 0 -10 0 0 Z',
  star: 'M0 -8 L2.4 -2.5 L8 -2.5 L3.8 1.4 L5.5 7 L0 3.7 L-5.5 7 L-3.8 1.4 L-8 -2.5 L-2.4 -2.5 Z',
  check: 'M114 219 L118 223 L126 214',
};

const palettes = {
  JS: { rim: '#bf9b29', edge: '#f0db4f', field: '#18212b', accent: '#f0db4f', ink: '#20282e' },
  TS: { rim: '#3178c6', edge: '#cfe7ff', field: '#122c47', accent: '#a7d5fa', ink: '#122c47' },
  PYTHON: { rim: '#4383b5', edge: '#ffdf76', field: '#18364e', accent: '#ffdf76', ink: '#18364e' },
  RUST: { rim: '#ac6848', edge: '#f0cfb8', field: '#30251f', accent: '#deb99e', ink: '#30251f' },
  GO: { rim: '#00acd7', edge: '#c1f1f8', field: '#123542', accent: '#8fdfef', ink: '#123542' },
  JAVA: { rim: '#3a83b5', edge: '#d9eaf5', field: '#18354c', accent: '#b5d8ef', ink: '#18354c' },
};

export function credentialBadgePalette(language: string | null) {
  return (
    palettes[credentialLanguageLogo(language).language as keyof typeof palettes] ?? {
      rim: '#286aaf',
      edge: '#b5d5ef',
      field: '#142e4d',
      accent: '#c3def4',
      ink: '#142e4d',
    }
  );
}

export function credentialBadgeRibbon(kind: string) {
  const labels: Record<string, string> = {
    first_lesson: 'PRIMEIRO PASSO',
    section: 'SEÇÃO CONCLUÍDA',
    course: 'CURSO CONCLUÍDO',
    practice: 'PRÁTICA CONCLUÍDA',
    path: 'TRILHA CONCLUÍDA',
  };
  return Object.hasOwn(labels, kind) ? labels[kind] : 'CONQUISTA';
}

export const credentialLaurelLeaves = [
  { x: 67, y: 146, angle: -10 },
  { x: 58, y: 131, angle: 8 },
  { x: 54, y: 116, angle: 20 },
  { x: 56, y: 102, angle: 35 },
];

export interface CredentialBadgeSvgOptions {
  language: string | null;
  kind: string;
  locked?: boolean;
  title?: string;
  /** Supply a distinct prefix when multiple SVG badges share a document. */
  idPrefix?: string;
}

export function credentialBadgeIdPrefix(idPrefix = 'standalone') {
  return `credential-badge-${
    Array.from(idPrefix)
      .map((character) => character.codePointAt(0)!.toString(16))
      .join('-') || 'standalone'
  }`;
}

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&apos;',
    };
    return entities[character];
  });
}

export function credentialBadgeTitle({ language, kind, locked, title }: CredentialBadgeSvgOptions) {
  return `${title ?? `${credentialBadgeRibbon(kind)} · ${credentialLanguageLogo(language).language}`}${locked ? ', a conquistar' : ''}`;
}

/** Only local, reviewed vector data enters this markup; all caller text is escaped separately. */
export function renderCredentialBadgeContents({
  language,
  kind,
  locked = false,
  idPrefix,
}: CredentialBadgeSvgOptions): string {
  const prefix = credentialBadgeIdPrefix(idPrefix);
  const palette = locked
    ? { rim: '#8795a7', edge: '#d3dce6', field: '#233346', accent: '#b7c4d3', ink: '#233346' }
    : credentialBadgePalette(language);
  const logo = credentialLanguageLogo(language);
  const ribbon = credentialBadgeRibbon(kind) as keyof typeof credentialRibbonOutlines;
  const [x, y, width, height] = logo.placement;
  const logoContents = logo.contents
    .replace(/\bid="([^"]+)"/g, (_match, id: string) => `id="${prefix}-logo-${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_match, id: string) => `url(#${prefix}-logo-${id})`);
  const leaves = credentialLaurelLeaves
    .map(
      ({ x: leafX, y: leafY, angle }) =>
        `<path d="${credentialBadgePaths.leaf}" transform="translate(${leafX} ${leafY}) rotate(${angle}) scale(.68)"/><path d="${credentialBadgePaths.leaf}" transform="translate(${240 - leafX} ${leafY}) scale(-1 1) rotate(${angle}) scale(.68)"/>`
    )
    .join('');
  const mutedFilter = locked
    ? `<defs><filter id="${prefix}-muted" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/></filter></defs>`
    : '';
  const status = locked
    ? `<circle cx="120" cy="219" r="12" fill="#e2e8f0"/><g fill="none" stroke="#475569" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="115" y="218" width="10" height="8" rx="1.5"/><path d="M117 218 V215 A3 3 0 0 1 123 215 V218"/></g>`
    : `<circle cx="120" cy="219" r="12" fill="#0083fe"/><path d="${credentialBadgePaths.check}" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;

  return `${mutedFilter}
<path d="${credentialBadgePaths.shield}" fill="${palette.rim}"/>
<path d="${credentialBadgePaths.shieldInset}" fill="${palette.field}"/>
<path d="${credentialBadgePaths.shieldField}" fill="none" stroke="${palette.accent}" stroke-width=".8" opacity=".45"/>
<path d="M108 35 Q120 29 132 35" fill="none" stroke="${palette.accent}" stroke-width="1.5" stroke-linecap="round"/>
<g fill="none" stroke="${palette.accent}" stroke-width="1.2" stroke-linecap="round" opacity=".65"><path d="${credentialBadgePaths.leftStem}"/><path d="${credentialBadgePaths.rightStem}"/></g>
<g fill="${palette.accent}" opacity=".7">${leaves}</g>
<circle cx="120" cy="101" r="53" fill="none" stroke="${palette.accent}" stroke-width="1" opacity=".8"/>
<circle cx="120" cy="101" r="49" fill="#ffffff"/>
<g${locked ? ` filter="url(#${prefix}-muted)" opacity=".6"` : ''}><svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="${logo.viewBox}" data-credential-logo="${logo.language}" aria-hidden="true" fill="#111111">${logoContents}</svg></g>
<path d="M17 179 L49 173 V205 L17 211 L27 195 Z M223 179 L191 173 V205 L223 211 L213 195 Z" fill="${palette.rim}"/>
<path d="M40 198 L52 207 V198 Z M200 198 L188 207 V198 Z" fill="${palette.field}"/>
<path d="${credentialBadgePaths.ribbonFront}" fill="${palette.edge}"/>
<path d="M47 174 Q120 186 193 174 M47 193 Q120 205 193 193" fill="none" stroke="${palette.ink}" stroke-width=".6" opacity=".25"/>
<path data-credential-ribbon="${escapeXml(ribbon)}" d="${credentialRibbonOutlines[ribbon]}" fill="${palette.ink}"/>
<g data-credential-status="${locked ? 'locked' : 'earned'}">${status}</g>`;
}

/** Pure standalone badge renderer shared by the browser and offline certificate/PDF output. */
export function renderCredentialBadgeSvg(options: CredentialBadgeSvgOptions): string {
  const titleId = `${credentialBadgeIdPrefix(options.idPrefix)}-title`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 260" width="240" height="260" role="img" aria-labelledby="${titleId}"><title id="${titleId}">${escapeXml(credentialBadgeTitle(options))}</title>${renderCredentialBadgeContents(options)}</svg>`;
}
