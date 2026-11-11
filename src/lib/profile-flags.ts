import { PROFILE_COUNTRY_NAMES } from './profile-flag-names';

/** Public, user-selected decoration catalog. A selection never infers an identity. */
export type ProfileFlagCategory = 'countries' | 'brazil' | 'pride' | 'community';
export interface ProfileFlagDefinition {
  id: string;
  label: string;
  description: string;
  imageUrl: string;
  category: ProfileFlagCategory;
}
export const PROFILE_COUNTRY_CODES =
  'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(
    ' '
  );

export const PROFILE_BRAZIL_STATES = [
  ['ac', 'Acre'],
  ['al', 'Alagoas'],
  ['ap', 'Amapá'],
  ['am', 'Amazonas'],
  ['ba', 'Bahia'],
  ['ce', 'Ceará'],
  ['df', 'Distrito Federal'],
  ['es', 'Espírito Santo'],
  ['go', 'Goiás'],
  ['ma', 'Maranhão'],
  ['mt', 'Mato Grosso'],
  ['ms', 'Mato Grosso do Sul'],
  ['mg', 'Minas Gerais'],
  ['pa', 'Pará'],
  ['pb', 'Paraíba'],
  ['pr', 'Paraná'],
  ['pe', 'Pernambuco'],
  ['pi', 'Piauí'],
  ['rj', 'Rio de Janeiro'],
  ['rn', 'Rio Grande do Norte'],
  ['rs', 'Rio Grande do Sul'],
  ['ro', 'Rondônia'],
  ['rr', 'Roraima'],
  ['sc', 'Santa Catarina'],
  ['sp', 'São Paulo'],
  ['se', 'Sergipe'],
  ['to', 'Tocantins'],
] as const;
// [id, label pt, description pt, label en, description en]
const pride = [
  [
    'rainbow',
    'Arco-íris / Orgulho LGBTQIA+',
    'Bandeira do orgulho com seis faixas nas cores do arco-íris.',
    'Rainbow / LGBTQIA+ Pride',
    'Pride flag with six stripes in the colors of the rainbow.',
  ],
  [
    'pride-progress',
    'Progress Pride',
    'Arco-íris com chevron preto, marrom, azul, rosa e branco.',
    'Progress Pride',
    'Rainbow with a black, brown, blue, pink and white chevron.',
  ],
  [
    'pride-trans',
    'Transgênero',
    'Faixas azul-claro, rosa e branca.',
    'Transgender',
    'Light blue, pink and white stripes.',
  ],
  [
    'pride-bi',
    'Bissexual',
    'Faixas rosa, roxa e azul.',
    'Bisexual',
    'Pink, purple and blue stripes.',
  ],
  [
    'pride-pan',
    'Pansexual',
    'Faixas rosa, amarela e azul.',
    'Pansexual',
    'Pink, yellow and blue stripes.',
  ],
  [
    'pride-lesbian',
    'Lésbica',
    'Cinco faixas em tons de laranja, branco e rosa.',
    'Lesbian',
    'Five stripes in shades of orange, white and pink.',
  ],
  [
    'pride-gay',
    'Gay',
    'Sete faixas em tons de verde, branco e azul.',
    'Gay',
    'Seven stripes in shades of green, white and blue.',
  ],
  [
    'pride-ace',
    'Assexual',
    'Faixas preta, cinza, branca e roxa.',
    'Asexual',
    'Black, gray, white and purple stripes.',
  ],
  [
    'pride-aro',
    'Arromântica',
    'Faixas verde, verde-claro, branca, cinza e preta.',
    'Aromantic',
    'Green, light green, white, gray and black stripes.',
  ],
  [
    'pride-nonbinary',
    'Não binária',
    'Faixas amarela, branca, roxa e preta.',
    'Non-binary',
    'Yellow, white, purple and black stripes.',
  ],
  [
    'pride-fluid',
    'Gênero-fluido',
    'Faixas rosa, branca, roxa, preta e azul.',
    'Genderfluid',
    'Pink, white, purple, black and blue stripes.',
  ],
  [
    'pride-intersex',
    'Intersexo',
    'Fundo amarelo com um círculo roxo.',
    'Intersex',
    'Yellow background with a purple circle.',
  ],
  [
    'pride-agender',
    'Agênero',
    'Sete faixas pretas, cinzas, brancas e verde-claro.',
    'Agender',
    'Seven black, gray, white and light green stripes.',
  ],
  [
    'pride-demi',
    'Demissexual',
    'Triângulo preto sobre faixas branca, roxa e cinza.',
    'Demisexual',
    'Black triangle over white, purple and gray stripes.',
  ],
] as const;

export const PROFILE_FLAG_IDS: readonly string[] = [
  ...PROFILE_COUNTRY_CODES,
  ...PROFILE_BRAZIL_STATES.map(([id]) => `br-${id}`),
  ...pride.map(([id]) => id),
  'dev',
  'community-communist',
];
const validIds = new Set(PROFILE_FLAG_IDS);
export function isProfileFlagId(value: unknown): value is string {
  return typeof value === 'string' && validIds.has(value);
}
const cache = new Map<string, ProfileFlagDefinition[]>();
/**
 * Flag catalog in Portuguese (default) or English (`locale` starting with `en`).
 * Labels never depend on the runtime's ICU data, so the server and the browser
 * always render the same text.
 */
export function getProfileFlagCatalog(locale = 'pt-BR'): ProfileFlagDefinition[] {
  const english = locale.toLowerCase().startsWith('en');
  const key = english ? 'en' : 'pt';
  const cached = cache.get(key);
  if (cached) return cached;
  const countries: ProfileFlagDefinition[] = PROFILE_COUNTRY_CODES.map((id) => {
    const names = PROFILE_COUNTRY_NAMES[id];
    const label = (names && names[english ? 1 : 0]) || id;
    return {
      id,
      label,
      description: english ? `National flag: ${label}.` : `Bandeira nacional: ${label}.`,
      category: 'countries',
      imageUrl: `/flags/profile/${id.toLowerCase()}.svg`,
    };
  });
  const catalog: ProfileFlagDefinition[] = [
    ...countries,
    ...PROFILE_BRAZIL_STATES.map(([code, label]) => ({
      id: `br-${code}`,
      label,
      description: english
        ? `Flag of ${label}, a Brazilian state (${code.toUpperCase()}).`
        : `Bandeira de ${label}, unidade federativa do Brasil (${code.toUpperCase()}).`,
      category: 'brazil' as const,
      imageUrl: `/flags/profile/br-${code}.svg`,
    })),
    ...pride.map(([id, labelPt, descriptionPt, labelEn, descriptionEn]) => ({
      id,
      label: english ? labelEn : labelPt,
      description: english ? descriptionEn : descriptionPt,
      category: 'pride' as const,
      imageUrl: `/flags/profile/${id}.svg`,
    })),
    {
      id: 'dev',
      label: english ? 'Development' : 'Desenvolvimento',
      description: english
        ? 'Flag of the software development community.'
        : 'Bandeira da comunidade de desenvolvimento.',
      category: 'community',
      imageUrl: '/flags/profile/dev.svg',
    },
    {
      id: 'community-communist',
      label: english ? 'Communist' : 'Comunista',
      description: english
        ? 'Red flag with a yellow hammer and sickle.'
        : 'Bandeira vermelha com foice e martelo em amarelo.',
      category: 'community',
      imageUrl: '/flags/profile/community-communist.svg',
    },
  ];
  cache.set(key, catalog);
  return catalog;
}
export const getProfileFlags = getProfileFlagCatalog;
