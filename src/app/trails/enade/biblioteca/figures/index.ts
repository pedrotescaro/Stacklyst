import { figures as arquitetura } from './arquitetura';
import { figures as bancoDeDados } from './banco-de-dados';
import { figures as empreendedorismoEGestao } from './empreendedorismo-e-gestao';
import { figures as engenhariaDeRequisitos } from './engenharia-de-requisitos';
import { figures as engenhariaDeSoftware } from './engenharia-de-software';
import { figures as estruturasDeDados } from './estruturas-de-dados';
import { figures as formacaoGeral } from './formacao-geral';
import { figures as logica } from './logica';
import { figures as matematica } from './matematica';
import type { FigureRegistry } from './types';

export const figureRegistry: FigureRegistry = {
  ...arquitetura,
  ...bancoDeDados,
  ...empreendedorismoEGestao,
  ...engenhariaDeRequisitos,
  ...engenhariaDeSoftware,
  ...estruturasDeDados,
  ...formacaoGeral,
  ...logica,
  ...matematica,
};

export function getFigure(id: string) {
  return Object.hasOwn(figureRegistry, id) ? figureRegistry[id] : undefined;
}
