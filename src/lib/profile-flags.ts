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
const pride = [
  [
    'rainbow',
    'Arco-íris / Orgulho LGBTQIA+',
    'Bandeira do orgulho com seis faixas nas cores do arco-íris.',
  ],
  ['pride-progress', 'Progress Pride', 'Arco-íris com chevron preto, marrom, azul, rosa e branco.'],
  ['pride-trans', 'Transgênero', 'Faixas azul-claro, rosa e branca.'],
  ['pride-bi', 'Bissexual', 'Faixas rosa, roxa e azul.'],
  ['pride-pan', 'Pansexual', 'Faixas rosa, amarela e azul.'],
  ['pride-lesbian', 'Lésbica', 'Cinco faixas em tons de laranja, branco e rosa.'],
  ['pride-gay', 'Gay', 'Sete faixas em tons de verde, branco e azul.'],
  ['pride-ace', 'Assexual', 'Faixas preta, cinza, branca e roxa.'],
  ['pride-aro', 'Arromântica', 'Faixas verde, verde-claro, branca, cinza e preta.'],
  ['pride-nonbinary', 'Não binária', 'Faixas amarela, branca, roxa e preta.'],
  ['pride-fluid', 'Gênero-fluido', 'Faixas rosa, branca, roxa, preta e azul.'],
  ['pride-intersex', 'Intersexo', 'Fundo amarelo com um círculo roxo.'],
  ['pride-agender', 'Agênero', 'Sete faixas pretas, cinzas, brancas e verde-claro.'],
  ['pride-demi', 'Demissexual', 'Triângulo preto sobre faixas branca, roxa e cinza.'],
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
export function getProfileFlagCatalog(locale = 'pt-BR'): ProfileFlagDefinition[] {
  const cached = cache.get(locale);
  if (cached) return cached;
  let names: Intl.DisplayNames;
  try {
    names = new Intl.DisplayNames([locale], { type: 'region' });
  } catch {
    names = new Intl.DisplayNames(['pt-BR'], { type: 'region' });
  }
  const countries: ProfileFlagDefinition[] = PROFILE_COUNTRY_CODES.map((id) => {
    const label = names.of(id) || id;
    return {
      id,
      label,
      description: `Bandeira nacional: ${label}.`,
      category: 'countries',
      imageUrl: `/flags/profile/${id.toLowerCase()}.svg`,
    };
  });
  const catalog: ProfileFlagDefinition[] = [
    ...countries,
    ...PROFILE_BRAZIL_STATES.map(([code, label]) => ({
      id: `br-${code}`,
      label,
      description: `Bandeira de ${label}, unidade federativa do Brasil (${code.toUpperCase()}).`,
      category: 'brazil' as const,
      imageUrl: `/flags/profile/br-${code}.svg`,
    })),
    ...pride.map(([id, label, description]) => ({
      id,
      label,
      description,
      category: 'pride' as const,
      imageUrl: `/flags/profile/${id}.svg`,
    })),
    {
      id: 'dev',
      label: 'Desenvolvimento',
      description: 'Bandeira da comunidade de desenvolvimento.',
      category: 'community',
      imageUrl: '/flags/profile/dev.svg',
    },
    {
      id: 'community-communist',
      label: 'Comunista',
      description: 'Bandeira vermelha com foice e martelo em amarelo.',
      category: 'community',
      imageUrl: '/flags/profile/community-communist.svg',
    },
  ];
  if (cache.size < 12) cache.set(locale, catalog);
  return catalog;
}
export const getProfileFlags = getProfileFlagCatalog;
