import crops from './book-crops.json';
import type { FigureSource } from './types';

export const bookFigures: Readonly<Record<string, (typeof crops)[keyof typeof crops]>> = crops;

export function getBookFigure(id: string) {
  if (!Object.hasOwn(bookFigures, id)) return undefined;
  const figure = bookFigures[id];
  const chapter = figure.number.split('.')[0];
  const source: FigureSource = {
    author: 'Sommerville',
    year: 2018,
    chapter: `10ª ed., cap. ${chapter}, p. ${figure.page}, fig. ${figure.number}`,
    reference: 'SOMMERVILLE, Ian. Engenharia de software. 10. ed. São Paulo: Pearson, 2018.',
  };

  return { ...figure, source, src: `/enade/library/book-figures/${id}.webp` };
}
