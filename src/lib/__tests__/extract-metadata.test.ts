import { describe, it, expect } from 'vitest';
import { extractPostMetadata } from '../editor/extract-metadata';

describe('extractPostMetadata', () => {
  it('should extract correct language for standard executable code blocks', () => {
    const body = 'Here is some code:\n```typescript\nconst x = 42;\n```';
    const metadata = extractPostMetadata(body);
    expect(metadata.language).toBe('TS');
    expect(metadata.code).toBe('const x = 42;');
    expect(metadata.isQuestion).toBe(true);
  });

  it('should extract correct language for static code blocks (with -static suffix)', () => {
    const body = 'Here is some static code:\n```typescript-static\nconst x = 42;\n```';
    const metadata = extractPostMetadata(body);
    expect(metadata.language).toBe('TS');
    expect(metadata.code).toBe('const x = 42;');
    expect(metadata.isQuestion).toBe(true);
  });

  it('should handle body with no code blocks', () => {
    const body = 'This is a simple post without code blocks.';
    const metadata = extractPostMetadata(body);
    expect(metadata.language).toBe(null);
    expect(metadata.code).toBe(null);
    expect(metadata.isQuestion).toBe(false);
  });

  it('preserves indentation and literal triple backticks inside a longer fence', () => {
    expect(extractPostMetadata('````python\n  value = "```"\n  print(value)\n````').code).toBe(
      '  value = "```"\n  print(value)'
    );
  });

  it('accepts tilde fences and CRLF without treating inline backticks as a block', () => {
    expect(extractPostMetadata('~~~javascript\r\nconst x = 1;\r\n~~~')).toMatchObject({
      language: 'JS',
      code: 'const x = 1;',
    });
    expect(extractPostMetadata('inline ```ts\nvalue\n```').code).toBeNull();
  });
});
