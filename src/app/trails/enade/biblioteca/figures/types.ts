import type { ComponentType } from 'react';

export type FigureSource = {
  author: string;
  year: number;
  chapter?: string;
  reference: string;
  href?: string;
};

export type FigureEntry = {
  component: ComponentType;
  title: string;
  alt: string;
  source: FigureSource;
  relatedSources?: FigureSource[];
  model: string;
  elements: string;
};

export type FigureRegistry = Record<string, FigureEntry>;
