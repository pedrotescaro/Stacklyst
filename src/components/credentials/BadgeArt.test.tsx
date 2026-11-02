import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { BadgeArt } from './BadgeArt';

afterEach(cleanup);

it('gives copied badges independent accessible titles, gradients and lock filters', () => {
  const { container } = render(
    <>
      <BadgeArt language="PYTHON" kind="course" title="Python do zero" size={144} />
      <BadgeArt language="PYTHON" kind="practice" title="Prática em Python" locked />
    </>
  );
  expect(screen.getByRole('img', { name: 'Python do zero' })).toHaveAttribute('width', '144');
  expect(screen.getByRole('img', { name: 'Prática em Python, a conquistar' })).toBeInTheDocument();
  const ids = Array.from(container.querySelectorAll('[id]')).map((element) => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  const references = Array.from(container.innerHTML.matchAll(/url\(#([^)]+)\)/g));
  for (const [, id] of references) expect(ids).toContain(id);
  expect(container.querySelectorAll('[data-credential-logo="PYTHON"]')).toHaveLength(2);
  expect(container.querySelectorAll('text')).toHaveLength(2);
});
