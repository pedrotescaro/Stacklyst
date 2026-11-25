import { describe, expect, it } from 'vitest';
import {
  asksForDiagram,
  diagramTypeFor,
  discursiveSummary,
  parseDiscursive,
  serializeDiscursive,
} from '../discursive';

const diagram = {
  nodes: [
    { id: 'a', x: 10, y: 10, title: 'Reserva', body: '+confirmar()' },
    { id: 'b', x: 200, y: 10, title: 'ReservaIda', body: '' },
  ],
  edges: [{ id: 'e', from: 'b', to: 'a', kind: 'inheritance' as const, label: '' }],
};

describe('discursive answers', () => {
  it('keeps plain text answers as plain text', () => {
    expect(serializeDiscursive({ text: 'minha resposta', diagram: null })).toBe('minha resposta');
    expect(parseDiscursive('minha resposta')).toEqual({ text: 'minha resposta', diagram: null });
  });

  it('round-trips text with a diagram', () => {
    const raw = serializeDiscursive({ text: 'ver diagrama', diagram });
    expect(parseDiscursive(raw)).toEqual({ text: 'ver diagrama', diagram });
  });

  it('treats JSON-looking text from a student as text', () => {
    expect(parseDiscursive('{"a":1}')).toEqual({ text: '{"a":1}', diagram: null });
  });

  it('summarises diagrams for result lists', () => {
    expect(discursiveSummary(serializeDiscursive({ text: '', diagram }))).toBe(
      '[Diagrama: 2 classes]'
    );
    const useCases = {
      type: 'usecase' as const,
      nodes: [
        { id: 'a', kind: 'actor' as const, x: 0, y: 0, title: 'Cliente', body: '' },
        { id: 'u', kind: 'usecase' as const, x: 0, y: 0, title: 'Reservar', body: '' },
      ],
      edges: [],
    };
    expect(discursiveSummary(serializeDiscursive({ text: 'ok', diagram: useCases }))).toBe(
      'ok\n[Diagrama: 1 ator, 1 caso de uso]'
    );
  });

  it('detects statements that ask for a diagram and which kind', () => {
    expect(asksForDiagram('elabore um diagrama de classes da UML')).toBe(true);
    expect(asksForDiagram('explique o conceito de herança')).toBe(false);
    expect(diagramTypeFor('elabore o diagrama de casos de uso')).toBe('usecase');
    expect(diagramTypeFor('elabore um diagrama de classes')).toBe('class');
  });
});
