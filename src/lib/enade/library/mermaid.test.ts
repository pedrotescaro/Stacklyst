// @vitest-environment jsdom
import mermaid from 'mermaid';
import { expect, it } from 'vitest';
import { loadLibrary } from './load';

const diagrams = loadLibrary().articles.flatMap(({ category, slug, blocks }) =>
  blocks.flatMap((block, index) => {
    if (block.type !== 'mermaid') return [];
    const after = blocks[index + 1];
    return [
      {
        file: `${category}/${slug}.md`,
        caption: block.caption,
        code: block.code,
        after: after?.type === 'markdown' ? after.text : '',
      },
    ];
  })
);

mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });

for (const { file, caption, code, after } of diagrams) {
  it(`${file} — ${caption}`, async () => {
    expect(caption).not.toBe('');
    await expect(mermaid.parse(code)).resolves.toHaveProperty('diagramType');
    expect(after.trimStart().split('\n', 1)[0]).toMatch(
      /^Fonte: adaptado de .+ — recriado pela equipe Stacklyst\.$/
    );
  });
}
