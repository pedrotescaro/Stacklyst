import { figures as arquitetura } from './arquitetura';
import type { FigureRegistry } from './types';

export const figureRegistry: FigureRegistry = {
  ...arquitetura,
};

export function getFigure(id: string) {
  return Object.hasOwn(figureRegistry, id) ? figureRegistry[id] : undefined;
}
