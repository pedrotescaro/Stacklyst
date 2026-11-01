import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import { docToMarkdown, markdownToDoc } from '../markdown';
import { remarkPostFormatting } from '../safe-inline';

describe('post formatting persistence', () => {
  it('roundtrips mixed marks, selected colors and literal punctuation', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'plain * punctuation ' },
            {
              type: 'text',
              text: 'styled',
              marks: [
                { type: 'bold' },
                { type: 'italic' },
                { type: 'underline' },
                { type: 'postColor', attrs: { color: 'blue' } },
              ],
            },
            { type: 'text', text: ' end' },
          ],
        },
      ],
    };
    const result = markdownToDoc(docToMarkdown(doc));
    const content = result.content![0].content!;
    expect(content.map((node) => node.text).join('')).toBe('plain * punctuation styled end');
    expect(content.find((node) => node.text === 'styled')?.marks).toEqual(
      expect.arrayContaining([
        { type: 'bold' },
        { type: 'italic' },
        { type: 'underline' },
        { type: 'postColor', attrs: { color: 'blue' } },
      ])
    );
    expect(content[0].marks).toBeUndefined();
  });

  it('preserves legacy markdown, nesting, links and executable code fences', () => {
    const value =
      '## Título\n\n- **forte**\n- *ênfase*\n\n[Stacklyst](https://example.com)\n\n```python\nprint(120)\n```';
    const doc = markdownToDoc(value);
    expect(doc.content?.find((node) => node.type === 'codeBlock')).toMatchObject({
      attrs: { language: 'python', isExecutable: true },
    });
    expect(markdownToDoc(docToMarkdown(doc))).toEqual(doc);
  });

  it('keeps code containing fence characters intact', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'codeBlock',
          attrs: { language: 'javascript', isExecutable: true },
          content: [{ type: 'text', text: 'console.log("```")' }],
        },
      ],
    };
    expect(markdownToDoc(docToMarkdown(doc)).content?.[0].content?.[0].text).toBe(
      'console.log("```")'
    );
  });

  it('renders allowlisted underline and color without enabling arbitrary HTML', () => {
    const content =
      '<u>underlined **bold**</u> <span data-post-color="rose">color</span> <img src=x onerror=alert(1)> <script>alert(1)</script>';
    const markup = renderToStaticMarkup(
      ReactMarkdown({ children: content, remarkPlugins: [remarkPostFormatting] })
    );
    expect(markup).toContain('<u>underlined <strong>bold</strong></u>');
    expect(markup).toContain('<span data-post-color="rose">color</span>');
    expect(markup).not.toContain('<img');
    expect(markup).not.toContain('<script');
    expect(markup).not.toContain('style=');
  });

  it('does not interpret unknown color attributes or markup inside code', () => {
    const markup = renderToStaticMarkup(
      ReactMarkdown({
        children: '<span data-post-color="red" onclick="alert(1)">text</span>\n\n`<u>literal</u>`',
        remarkPlugins: [remarkPostFormatting],
      })
    );
    expect(markup).not.toContain('<span data-post-color=');
    expect(markup).toContain('<code>&lt;u&gt;literal&lt;/u&gt;</code>');
  });
});
