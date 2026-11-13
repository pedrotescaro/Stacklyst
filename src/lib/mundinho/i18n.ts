// Client-safe English copy for Mundinho. Never put answer-bank text (questions, explanations,
// challenge solutions) here: those live in the server-only `i18n.server.ts`.

export type MundinhoLanguage = 'pt' | 'en';

/** Exact pt-BR → English strings shown by Mundinho screens or sent by its API. */
export const MUNDINHO_EN: Record<string, string> = {
  // Creatures
  'Gosma de sintaxe': 'Syntax slime',
  'Gota de lógica': 'Logic drop',
  'Faísca recursiva': 'Recursive spark',
  'Besouro de bits': 'Bit beetle',
  'Broto booleano': 'Boolean sprout',
  'Sombra do nulo': 'Null shadow',
  'Sentinela de ferro': 'Iron sentinel',
  'Chama indomável': 'Untamed flame',
  'Titã do vazio': 'Void titan',

  // Cosmetic items
  'Jaqueta da alvorada': 'Dawn jacket',
  'Vermelho de quem começa uma aventura.': 'The red of someone starting an adventure.',
  'Moletom de nuvens': 'Cloud hoodie',
  'Conforto para explorar novas ideias.': 'Comfort for exploring new ideas.',
  'Jaqueta do compilador': 'Compiler jacket',
  'Detalhes em verde de terminal.': 'Terminal-green details.',
  'Moldura dourada': 'Golden frame',
  'Uma borda especial para seu aventureiro.': 'A special border for your adventurer.',
  'Chapéu de explorador': 'Explorer hat',
  'Para os caminhos menos óbvios.': 'For the less obvious paths.',
  'Cabelo aurora': 'Aurora hair',
  'Um corte cheio de personalidade.': 'A haircut full of personality.',
  'Caça-bugs': 'Bug Hunter',
  'Equipado, permite atacar sem resolver exercícios de código nas batalhas.':
    'When equipped, lets you attack without solving code exercises in battles.',
  Vagalumes: 'Fireflies',
  'Pequenas luzes acompanham seu avatar.': 'Little lights follow your avatar.',

  // Rarities
  Comum: 'Common',
  Raro: 'Rare',
  Épico: 'Epic',
  Lendário: 'Legendary',

  // Equipment
  'Trevo da clareira': 'Clearing clover',
  'Um pequeno amuleto para encontrar oportunidades.': 'A small charm for finding opportunities.',
  'Amuleto lunar': 'Lunar charm',
  'A luz da lua acompanha suas escolhas.': 'Moonlight follows your choices.',
  'Estrela da fortuna': 'Star of fortune',
  'Uma estrela guardada pelos habitantes da floresta.': 'A star kept by the forest dwellers.',
  'Escudo do bosque': 'Grove shield',
  'Madeira resistente para aparar os contra-ataques.': 'Sturdy wood to parry counterattacks.',
  'Escudo de ferro': 'Iron shield',
  'Uma defesa firme para encontros mais difíceis.': 'A solid defense for tougher encounters.',
  'Égide de cristal': 'Crystal aegis',
  'Cristais unidos em uma proteção duradoura.': 'Crystals joined into lasting protection.',
  'Pingente vital': 'Vital pendant',
  'Uma lembrança da energia da clareira.': 'A keepsake of the clearing’s energy.',
  'Orbe da vida': 'Orb of life',
  'Energia concentrada para uma jornada mais longa.': 'Concentrated energy for a longer journey.',
  'Núcleo da fênix': 'Phoenix core',
  'Uma relíquia luminosa que fortalece seu aventureiro.':
    'A glowing relic that strengthens your adventurer.',
  Amuleto: 'Charm',
  Proteção: 'Protection',
  Relíquia: 'Relic',

  // Skills
  'Aplicar conceito': 'Apply concept',
  '30 de dano': '30 damage',
  Depurar: 'Debug',
  '18 de dano · recupera 20 de vida': '18 damage · restores 20 HP',
  Refatorar: 'Refactor',
  '45 de dano · recebe 8 de desgaste': '45 damage · takes 8 recoil',

  // World objects
  'Ada (Guia)': 'Ada (Guide)',
  'Placa de dicas': 'Hint sign',
  'Baú da clareira': 'Clearing chest',
  'Descer para a arena multiplayer': 'Go down to the multiplayer arena',

  // Skin palettes
  'Pêssego Claro': 'Light Peach',
  'Lilás Fantasia': 'Fantasy Lilac',
  'Morena Âmbar': 'Amber Tan',
  'Bege Rosado': 'Rosy Beige',
  'Azul Névoa': 'Mist Blue',
  'Marfim Pálido': 'Pale Ivory',
  'Dourado Trigo': 'Wheat Gold',
  'Areia Suave': 'Soft Sand',
  'Cacau Profundo': 'Deep Cocoa',

  // Outfits
  'Jaqueta de aventura': 'Adventure jacket',
  'Moletom azul': 'Blue hoodie',
  'Jaqueta tech': 'Tech jacket',
  'Casaco florestal': 'Forest coat',
  'Suéter carmim': 'Crimson sweater',
  'Traje dourado': 'Golden outfit',
  'Bomber coral': 'Coral bomber',
  'Jaqueta jeans': 'Denim jacket',
  'Cardigã lavanda': 'Lavender cardigan',
  'Sobretudo noturno': 'Night overcoat',
  'Uniforme colegial japon�s': 'Japanese school uniform',
  'Túnica do bosque': 'Grove tunic',

  // Hair colors
  'Castanho escuro': 'Dark brown',
  'Castanho claro': 'Light brown',
  'Loiro dourado': 'Golden blond',
  'Loiro claro': 'Light blond',
  Acobreado: 'Copper',
  Platinado: 'Platinum',

  // Missions
  'Conclua uma lição de aprendizagem': 'Complete a learning lesson',
  'Acerte 5 questões de código': 'Get 5 code questions right',
  'Vença uma batalha de conceitos': 'Win a concept battle',
  'Concluir uma atividade de aprendizagem': 'Complete a learning activity',
  'Acertar cinco questões': 'Get five questions right',
  'Vencer uma batalha de conceitos': 'Win a concept battle',

  // Ledger labels
  'Sorteio de equipamento da vitória': 'Victory equipment roll',
  'Moedas das atividades concluídas': 'Coins from completed activities',
  'Novas atividades concluídas': 'New completed activities',
  'Baú diário da clareira': 'Daily clearing chest',

  // Adventure notices and errors
  'A batalha foi atualizada. Este turno já não está ativo.':
    'The battle was updated. This turn is no longer active.',
  'Este turno não é um desafio de código.': 'This turn is not a code challenge.',
  'Não foi possível executar o código.': 'Could not run the code.',
  'Seu turno não foi consumido. Revise ou tente novamente.':
    'Your turn was not used. Review it or try again.',
  'Você já abriu o baú hoje. Volte amanhã para ganhar mais 10 moedas.':
    'You already opened the chest today. Come back tomorrow for 10 more coins.',
  'Este item não está disponível.': 'This item is not available.',
  'Moedas insuficientes. Complete atividades e faça check-in para ganhar mais.':
    'Not enough coins. Complete activities and check in to earn more.',
  'Esta compra já foi registrada. Atualize seu inventário.':
    'This purchase was already recorded. Refresh your inventory.',
  'Adquira este cosmético na loja antes de equipar.':
    'Get this cosmetic in the store before equipping it.',
  'Este equipamento ainda não está no seu inventário.':
    'This equipment is not in your inventory yet.',
  'Troque seus equipamentos depois de encerrar a batalha.':
    'Change your equipment after the battle ends.',
  'Este item ainda não está no seu inventário.': 'This item is not in your inventory yet.',
  'Conclua a missão antes de resgatar.': 'Complete the mission before claiming it.',
  'Criatura desconhecida.': 'Unknown creature.',
  'Batalha não encontrada. Atualize para continuar.': 'Battle not found. Refresh to continue.',
  'Esta batalha já terminou. Seu resultado foi atualizado.':
    'This battle has already ended. Your result was updated.',
  'Você voltou à clareira. Seu progresso de aprendizagem está salvo.':
    'You returned to the clearing. Your learning progress is saved.',
  'Este turno já foi resolvido. A batalha foi atualizada sem repetir o golpe.':
    'This turn was already resolved. The battle was updated without repeating the move.',
  'Não há desafios para esta linguagem.': 'There are no challenges for this language.',
  'Desta vez o golpe precisa do seu conhecimento. Resolva o exercício e confirme o ataque.':
    'This time the move needs your knowledge. Solve the exercise and confirm the attack.',
  'O desafio deste turno mudou. A batalha foi atualizada.':
    'This turn’s challenge changed. The battle was updated.',
  'Equipe o título Caça-bugs para usar esta habilidade.':
    'Equip the Bug Hunter title to use this ability.',
  'O Caça-bugs dispensa apenas exercícios de código.': 'Bug Hunter only skips code exercises.',
  'Responda este desafio com código.': 'Answer this challenge with code.',
  'Este desafio de código não está ativo.': 'This code challenge is not active.',
  'Desafio concluído!': 'Challenge complete!',
  'Revise os comandos.': 'Review the commands.',
  'Nenhum equipamento caiu desta vez.': 'No equipment dropped this time.',
  'Não foi possível aceitar o convite.': 'Could not accept the invitation.',
  'Não foi possível confirmar o resgate. Tente novamente.':
    'Could not confirm the claim. Try again.',
  'Origem da requisição não permitida.': 'Request origin not allowed.',

  // Arena
  'Resolva o exercício para confirmar este golpe.': 'Solve the exercise to confirm this move.',
  'Este turno já mudou. Atualize a arena.': 'This turn already changed. Refresh the arena.',
  'Escolha atacar antes de executar um exercício.': 'Choose to attack before running an exercise.',
  'O desafio deste turno mudou.': 'This turn’s challenge changed.',
  'Executor indisponível. Seu turno foi preservado.': 'Runner unavailable. Your turn was kept.',
  'Este convite expirou ou não pertence a você.': 'This invitation expired or is not yours.',
  'O anfitrião saiu ou a arena já está ocupada.': 'The host left or the arena is already full.',
  'Saia da sua arena atual antes de aceitar outro convite.':
    'Leave your current arena before accepting another invitation.',
  'Dois aventureiros na arena. Confirmem para começar.':
    'Two adventurers in the arena. Confirm to start.',
  'A arena foi encerrada porque vocês não são mais amigos mútuos.':
    'The arena was closed because you are no longer mutual friends.',
  'O adversário deixou a arena. Vitória por desistência.':
    'The opponent left the arena. Victory by forfeit.',
  'O adversário desconectou. Vitória por desconexão.':
    'The opponent disconnected. Victory by disconnection.',
  'Tempo esgotado. O turno passou para o adversário.':
    'Time’s up. The turn passed to the opponent.',
  'Já há um amigo nesta arena.': 'There is already a friend in this arena.',
  'Encerre a batalha antes de convidar outra pessoa.':
    'End the battle before inviting someone else.',
  'Aguarde o convite atual expirar antes de convidar outro amigo.':
    'Wait for the current invitation to expire before inviting another friend.',
  'Espere seu amigo ficar online na arena.': 'Wait for your friend to come online in the arena.',
  'Revanche solicitada. Confirmem para começar.': 'Rematch requested. Confirm to start.',
  'Esta batalha já foi iniciada.': 'This battle has already started.',
  'Batalha iniciada! Seus equipamentos estão ativos. Escolha atacar.':
    'Battle started! Your equipment is active. Choose to attack.',
  'O turno mudou. Nenhum golpe foi repetido.': 'The turn changed. No move was repeated.',
  'O exercício deste turno já foi definido. Resolva-o para atacar.':
    'This turn’s exercise is already set. Solve it to attack.',
  'O turno mudou durante a execução. Nenhum golpe foi repetido.':
    'The turn changed during the run. No move was repeated.',
  'O código não passou. Turno do adversário.': 'The code did not pass. Opponent’s turn.',

  // Code challenge structure rules
  'Use os comandos e sensores públicos do mundo; os marcadores internos são reservados.':
    'Use the world’s public commands and sensors; internal markers are reserved.',
  'Use if e else com um sensor do mundo para decidir uma ação.':
    'Use if and else with a world sensor to decide on an action.',
  'Use um laço for ou while (ou loop no Rust) para repetir as ações do mundo.':
    'Use a for or while loop (or loop in Rust) to repeat the world actions.',

  // Code evaluation (public replay feedback)
  'Você chegou ao limite do caminho. Revise seus movimentos.':
    'You reached the end of the path. Review your moves.',
  'Use somente os comandos do mundo. Limite de 40 ações por execução.':
    'Use only the world commands. Limit of 40 actions per run.',
  'Use if e else com um sensor do mundo. A condição precisa ser executada para decidir suas ações.':
    'Use if and else with a world sensor. The condition must run to decide your actions.',
  'Use um laço para executar ações do mundo em pelo menos duas iterações.':
    'Use a loop to run world actions in at least two iterations.',

  // Code challenge board tiles (labels double as sprite keys, so only the display is localized)
  Caminho: 'Path',
  Cristal: 'Crystal',
  Flor: 'Flower',
  Lanterna: 'Lantern',
  Alavanca: 'Lever',
  Rocha: 'Rock',
  Baú: 'Chest',
  Canteiro: 'Bed',
  Bichinho: 'Critter',
  Máquina: 'Machine',
  Gaiola: 'Cage',
  Fruto: 'Fruit',
  Muda: 'Seedling',
  Altar: 'Altar',
  Concluído: 'Done',

  // Difficulty labels
  Fácil: 'Easy',
  Médio: 'Medium',
  Difícil: 'Hard',
  Iniciante: 'Beginner',
  Intermediário: 'Intermediate',
  Avançado: 'Advanced',
};

type Translate = (value: string) => string;
type Pattern = [RegExp, (match: RegExpMatchArray, tr: Translate) => string];

const word = (value: string, tr: Translate) => tr(value);

/** Templated messages composed on the server; captured names are translated recursively. */
export const MUNDINHO_EN_PATTERNS: Pattern[] = [
  [/^Vitória · (.+)$/, (m, tr) => `Victory · ${word(m[1], tr)}`],
  [/^Check-in · dia (\d+)$/, (m) => `Check-in · day ${m[1]}`],
  [/^(.+) repetido · \+(\d+) moedas$/, (m, tr) => `${word(m[1], tr)} duplicate · +${m[2]} coins`],
  [/^Equipamento encontrado · (.+)$/, (m, tr) => `Equipment found · ${word(m[1], tr)}`],
  [
    /^Equipamento repetido: (.+), convertido em (\d+) moedas\.$/,
    (m, tr) => `Duplicate equipment: ${word(m[1], tr)}, converted into ${m[2]} coins.`,
  ],
  [
    /^Você encontrou (.+)! Está no inventário\.$/,
    (m, tr) => `You found ${word(m[1], tr)}! It is in your inventory.`,
  ],
  [
    /^(Caça-bugs equipado!|Sorte!) (.+) aplicou um golpe direto, sem exercício: (\d+) de dano\.([\s\S]*)$/,
    (m, tr) =>
      `${m[1] === 'Sorte!' ? 'Lucky!' : 'Bug Hunter equipped!'} ${word(m[2], tr)} landed a direct hit, no exercise: ${m[3]} damage.${trTail(m[4], tr)}`,
  ],
  [
    /^Correto! (.+?) causou (\d+) de dano\. ?([\s\S]*)$/,
    (m, tr) => `Correct! ${word(m[1], tr)} dealt ${m[2]} damage. ${trTail(m[3], tr)}`.trimEnd(),
  ],
  [
    /^Ainda não\. O inimigo aproveitou a abertura\. ?([\s\S]*)$/,
    (m, tr) => `Not yet. The enemy took the opening. ${trTail(m[1], tr)}`.trimEnd(),
  ],
  [
    /^Escolha um golpe: (\d+)% de chance de ataque direto e (\d+)% de exercício\.$/,
    (m) => `Choose a move: ${m[1]}% chance of a direct attack and ${m[2]}% exercise.`,
  ],
  [
    /^Esta criatura requer nível (\d+)\. Continue aprendendo para enfrentá-la\.$/,
    (m) => `This creature requires level ${m[1]}. Keep learning to face it.`,
  ],
  [
    /^Código correto! (\d+) de dano no adversário\.$/,
    (m) => `Correct code! ${m[1]} damage to the opponent.`,
  ],
  [
    /^(.+): (Caça-bugs \/ sorte máxima!|Golpe direto!) (\d+) de dano no adversário\.( Recupera até 20 de vida\.| Recebe 8 de desgaste\.)?$/,
    (m, tr) =>
      `${word(m[1], tr)}: ${m[2] === 'Golpe direto!' ? 'Direct hit!' : 'Bug Hunter / max luck!'} ${m[3]} damage to the opponent.${
        m[4] ? (m[4].includes('Recupera') ? ' Restores up to 20 HP.' : ' Takes 8 recoil.') : ''
      }`,
  ],
  [/^(.+) venceu!$/, (m) => `${m[1]} won!`],
  [
    /^Não é possível usar (\w+) nesta casa\. Confira o objeto e a ação\.$/,
    (m) => `You can't use ${m[1]} on this tile. Check the object and the action.`,
  ],
  [
    /^Você realizou (\d+) de (\d+) ações\. Continue o caminho e confira os comandos\.$/,
    (m) => `You completed ${m[1]} of ${m[2]} actions. Keep going and check the commands.`,
  ],
];

function trTail(tail: string, tr: Translate): string {
  if (!tail) return '';
  const trimmed = tail.trim();
  if (!trimmed) return '';
  const leading = tail.startsWith(' ') ? ' ' : '';
  return leading + translateSentences(trimmed, tr);
}

function translateSentences(value: string, tr: Translate): string {
  const direct = tr(value);
  if (direct !== value) return direct;
  // Try each sentence on its own (server messages are often concatenated).
  const parts = value.split(/(?<=[.!?])\s+/);
  if (parts.length < 2) return value;
  // Greedily combine the longest known prefix.
  for (let end = parts.length - 1; end >= 1; end--) {
    const head = parts.slice(0, end).join(' ');
    const translatedHead = tr(head);
    if (translatedHead !== head) {
      return `${translatedHead} ${translateSentences(parts.slice(end).join(' '), tr)}`;
    }
  }
  return `${parts[0]} ${translateSentences(parts.slice(1).join(' '), tr)}`;
}

/** Builds a translator from a dictionary; used on the client and, with more entries, on the server. */
export function createMundinhoTranslator(dictionary: Record<string, string>) {
  const translate: Translate = (value) => {
    if (!value) return value;
    const exact = dictionary[value];
    if (exact !== undefined) return exact;
    for (const [pattern, build] of MUNDINHO_EN_PATTERNS) {
      const match = value.match(pattern);
      if (match) return build(match, translate);
    }
    return value;
  };
  return (value: string) => {
    const result = translate(value);
    return result === value ? translateSentences(value, translate) : result;
  };
}

const translateClient = createMundinhoTranslator(MUNDINHO_EN);

export function translateMundinho(value: string, language: MundinhoLanguage): string;
export function translateMundinho(
  value: string | undefined | null,
  language: MundinhoLanguage
): string | undefined | null;
export function translateMundinho(value: string | undefined | null, language: MundinhoLanguage) {
  if (language !== 'en' || !value) return value;
  return translateClient(value);
}

export const MUNDINHO_LANGUAGE_HEADER = 'x-stacklyst-language';
