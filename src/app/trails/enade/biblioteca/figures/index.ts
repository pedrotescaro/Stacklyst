import { figures as arquitetura } from './arquitetura';
import { figures as bancoDeDados } from './banco-de-dados';
import { figures as empreendedorismoEGestao } from './empreendedorismo-e-gestao';
import type { FigureRegistry } from './types';

export const figureRegistry: FigureRegistry = {
  ...arquitetura,
  ...bancoDeDados,
  ...empreendedorismoEGestao,
};

export function getFigure(id: string) {
  return Object.hasOwn(figureRegistry, id) ? figureRegistry[id] : undefined;
}
