import { describe, expect, it } from 'vitest';
import { readReplyAudience, withReplyAudience } from '@/lib/post-composer';

describe('reply audience marker', () => {
  it('reads the trailing marker and defaults to everyone', () => {
    expect(readReplyAudience('Oi pessoal')).toBe('everyone');
    expect(readReplyAudience('Oi\n\n🔒 Apenas seguidores podem responder')).toBe('followers');
    expect(readReplyAudience('Oi\n\n🔒 Apenas pessoas mencionadas podem responder\n')).toBe(
      'mentioned'
    );
  });

  it('replaces or removes the marker and keeps location and sensitive markers', () => {
    const body = '⚠️ Conteúdo sensível\n\nOi\n\n📍 Remoto\n\n🔒 Apenas seguidores podem responder';
    expect(withReplyAudience(body, 'mentioned')).toBe(
      '⚠️ Conteúdo sensível\n\nOi\n\n📍 Remoto\n\n🔒 Apenas pessoas mencionadas podem responder'
    );
    expect(withReplyAudience(body, 'everyone')).toBe('⚠️ Conteúdo sensível\n\nOi\n\n📍 Remoto');
    expect(withReplyAudience('Oi', 'followers')).toBe('Oi\n\n🔒 Apenas seguidores podem responder');
  });
});
