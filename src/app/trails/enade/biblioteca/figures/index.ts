import { figures as arquitetura } from './arquitetura';
import { figures as bancoDeDados } from './banco-de-dados';
import type { FigureRegistry } from './types';

export const figureRegistry: FigureRegistry = {
  ...arquitetura,
  ...bancoDeDados,
};

export function getFigure(id: string) {
  return Object.hasOwn(figureRegistry, id) ? figureRegistry[id] : undefined;
}
